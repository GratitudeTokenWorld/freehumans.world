// userController.ts - Handles HTTP requests related to user operations, such as creating a user account, checking username availability, and validating user tokens.
import { Express } from 'express';
import { createRateLimiter } from '../middleware/limiter';
import * as path from 'path';
import { promises as fs } from 'fs';
import { Api, JsonRpc, RpcError, JsSignatureProvider, Key } from '@proton/js';
import db from '../utils/scylladb';
import { shamir } from '../utils/shamir'; // Shamir method
import { deshamir } from '../utils/deshamir'; // DeShamir method
import { decryptString } from '../utils/user_share_decrypt';

// Proton Keys Generator
import { Mnemonic } from '@proton/mnemonic';

const defaultPrivateKey: string = ""; // 58 chars key, user test1515 on testnet // this should 
const signatureProvider: JsSignatureProvider = new JsSignatureProvider([defaultPrivateKey]);

// Setting up the Proton blockchain RPC and API with a given node endpoint and a signature provider.
const endpoint = 'https://testnet.protonchain.com';
const rpc = new JsonRpc(endpoint);
const api = new Api({ rpc, signatureProvider });

// Assuming newUser is the username for which the directory is being created
async function createUserDirectory(newUser: string): Promise<void> {
    try {
        let userDirectory: string;
        if (process.env.NODE_ENV === 'production') {
            userDirectory = path.join('/home', 'admin', 'domains', 'freehumans.world', 'users', newUser);
        } else {
            // Adjust for your local development environment path as necessary
            userDirectory = path.join(__dirname, '../users', newUser); // Example for local development
        }

        await fs.mkdir(userDirectory, { recursive: true });
        console.log(`Directory created: ${userDirectory}`);
    } catch (error) {
        console.error(`Error creating directory: ${error}`);
    }
}

export const checkUsernameAvailability = (app: Express) => {
    // Defines a GET endpoint to check username availability.
    // Apply the rate limiting middleware specifically to this route.
    app.get('/checkUsernameAvailability', createRateLimiter(100, 15), async (req, res) => {
        // Retrieves the username query parameter and ensures it's a string.
        const userChecked: string = String(req.query.username || '');

        // Validate the username with regex
        const isValidUsername = /^[a-z1-5]{4,12}$/.test(userChecked);
        if (!isValidUsername) {
            return res.status(400).send('Username must be 4-12 characters long, including lowercase letters or digits 1-5.');
        }

        try {
            // Attempts to fetch account information from the blockchain.
            res.status(200).send(await rpc.get_account(userChecked))
        } catch (e) {
            //console.error('\nCaught exception: ', e);
            if (e instanceof RpcError) {
                e.json.code === 500 ? res.send({ 'message': e.details[0].message }) : null;
            } else {
                // Handles non-RPC errors, indicating an unknown or unexpected error occurred.
                res.status(500).send({ message: "An unknown error occurred." });
            }
        }
    });
}

export const getTokens = (app: Express) => {
    app.get('/getTokens', createRateLimiter(100, 15), async (req, res) => {
        const username: string = String(req.query.username || '');

        try {
            const gigi = await rpc.get_currency_balance('grat', username, 'GRAT');
            // Attempts to fetch account information from the blockchain.
            res.send({ grat: parseInt(gigi[0]).toFixed(2) });
        } catch (e) {
            //console.error('\nCaught exception: ', e);
            if (e instanceof RpcError) {
                e.json.code === 500 ? res.send({ 'message': e.details[0].message }) : null;
            } else {
                // Handles non-RPC errors, indicating an unknown or unexpected error occurred.
                res.status(500).send({ message: "An unknown error occurred." });
            }
        }
    });
}



// export const PVTCheck = (app: Express) => {
//     // Defines a GET endpoint to check username availability.
//     // Apply the rate limiting middleware specifically to this route.
//     app.get('/pvt-check', createRateLimiter(100, 15), async (req, res) => {
//         // Retrieves the username query parameter and ensures it's a string.
//         const user: string = String(req.body.username || '');
//         const key: string = String(req.body.key || '');

//         // Validate the username with regex
//         const isValidUsername = /^[a-z1-5]{4,12}$/.test(user);
//         if (!isValidUsername) {
//             return res.status(400).send('Username must be 4-12 characters long, including lowercase letters or digits 1-5.');
//         }

//         try {
//             // Attempts to fetch account information from the blockchain.
//             res.status(200).send(await api.getAccountKeys({ actor: 'test1515', permission: 'active' }))
//         } catch (e) {
//             //console.error('\nCaught exception: ', e);
//             if (e instanceof RpcError) {
//                 e.json.code === 500 ? res.send({ 'message': e.details[0].message }) : null;
//             } else {
//                 // Handles non-RPC errors, indicating an unknown or unexpected error occurred.
//                 res.status(500).send({ message: "An unknown error occurred." });
//             }
//         }
//     });
// }
export const checkInviter = (app: Express) => {
    app.get('/checkInviter', createRateLimiter(10, 15), async (req, res) => {
        const userChecked: string = String(req.query.username || '');

        // Validate the username with regex
        const isValidUsername = /^[a-z1-5]{4,12}$/.test(userChecked);
        if (!isValidUsername) {
            return res.status(400).send('Username must be 4-12 characters long, including lowercase letters or digits 1-5.');
        }

        const query = 'SELECT UserName FROM users WHERE UserName = ?';

        try {
            const result = await db.execute(query, [userChecked], { prepare: true });
            // Check if any rows were returned, which means the username is taken
            if (result.rowLength > 0) {
                // The inviter exists
                res.status(200).send({ message: 'Inviter exists.', userChecked });
            } else {
                // The inviter does not exist
                res.status(404).send({ message: 'Inviter does not exist.' });
            }
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).send({ message: 'An error occurred while checking the inviter.' });
        }
    });
};

export const registerAccount = (app: Express) => {
    app.post('/register-account', createRateLimiter(10, 15), async (req, res) => {
        const { email, username, key, invitedby } = req.body;

        // Dynamic assignment of newUser based on 'username' or 'key'
        let newUser: string;
        let finalKey: string | undefined;
        // Generates a new key pair for the account, ensuring security.
        let mnemonic: Mnemonic | null = new Mnemonic();
        const { publicKey, privateKey } = mnemonic.keyPairAtIndex(0);

        if (key) {
            finalKey = key;
            const privateKey = Key.PrivateKey.fromString(key);
            const publicKey = privateKey.getPublicKey().toString();
            const response = await fetch("https://testnet-lightapi.eosams.xeos.me/api/key/" + publicKey);
            const data = await response.json();
            newUser = Object.keys(data.protontest.accounts)[0];
        } else if (username) {
            newUser = username;
            finalKey = privateKey;
        } else {
            return res.status(400).send({ error: 'Either key or username must be provided.' });
        }


        try {
            // Basic validations
            if (!newUser || newUser.length > 12 || newUser.length < 4) {
                return res.status(400).send({ error: "Username is required and must be less than 13 characters." });
            }

            if (!email) {
                return res.status(400).send({ error: "Email is required." });
            }

            // Save user data in the database
            await saveUserData(email, newUser, invitedby);

            // Await the blockchain account creation and capture the result
            const result = await createPaidBlockchainAccount(email, username, newUser, finalKey || '');

            // After successful account creation, the mnemonic (and thus the private key) is cleared from memory.
            mnemonic = null;

            // Respond with success and the blockchain creation result
            res.status(200).send({ message: 'Data saved successfully.', newUser, email, invitedby, result });
        } catch (error) {
            // Handle known and unknown errors
            if (error instanceof Error && error.message === 'User already registered.') {
                res.status(409).send({ error: 'User already registered.' });
            } else {
                console.error('Error:', error);
                res.status(500).send({ error: 'Failed to save user data or create blockchain account.' });
            }
        }
    });
}

// Function to create a new account on the Proton blockchain with paid resources (RAM, CPU, and NET).
export const createPaidBlockchainAccount = async (email: string, user: string, newUser: string, pvt_key: string) => {

    //Buys RAM for the new account to ensure sufficient resources for account creation.
    // try {
    //     await api.transact({
    //         actions: [{
    //             account: "eosio",
    //             name: "buyrambytes",
    //             authorization: [{ actor: "test1515", permission: "active" }],
    //             data: { payer: "test1515", receiver: 'test1515', bytes: 2996 }
    //         }]
    //     }, {
    //         blocksBehind: 3,
    //         expireSeconds: 30,
    //     });
    // } catch (e) {
    //     console.log(e);

    //     if (e instanceof RpcError) {
    //         return { 'message': e.details[0].message }
    //     } else {
    //         return { message: "An unknown error occurred trying to buy RAM for the new account." };
    //     }
    // }

    // create the account
    try {


        // Proceeds to create the new account with the new public key and bought resources.
        // const result = await api.transact({
        //     "actions": [
        //         {
        //             "account": "eosio",
        //             "name": "newaccount",
        //             "authorization": [{
        //                 "actor": "test1515",
        //                 "permission": "active"
        //             }],
        //             "data": {
        //                 "creator": "test1515",
        //                 "name": newUser, // I think this is the display name
        //                 "owner": {
        //                     "threshold": 1,
        //                     "keys": [
        //                         {
        //                             "weight": 1,
        //                             "key": publicKey
        //                         }
        //                     ],
        //                     "accounts": [],
        //                     "waits": []
        //                 },
        //                 "active": {
        //                     "threshold": 1,
        //                     "keys": [
        //                         {
        //                             "weight": 1,
        //                             "key": publicKey
        //                         }
        //                     ],
        //                     "accounts": [],
        //                     "waits": []
        //                 }
        //             }
        //         },
        //         {
        //             "account": "eosio",
        //             "name": "buyrambytes",
        //             "authorization": [{
        //                 "actor": "test1515",
        //                 "permission": "active"
        //             }
        //             ],
        //             "data": {
        //                 "payer": "test1515",
        //                 "receiver": newUser,
        //                 "bytes": 2996
        //             }
        //         },
        //         {
        //             "account": "eosio.proton",
        //             "name": "newaccres",
        //             "authorization": [{
        //                 "actor": "test1515",
        //                 "permission": "active"
        //             }],
        //             "data": {
        //                 "account": newUser
        //             }
        //         }
        //     ]
        // }, {
        //     blocksBehind: 3,
        //     expireSeconds: 30,
        // });
        console.log(pvt_key); // must be removed in production
        // shamir the privateKey 
        if (!pvt_key || pvt_key === '') {
            return 'No private key passed to createPaidBlockchainAccount fn.';
        } else {
            shamir(email, user, pvt_key).catch(console.error)
        }

        // Optionally, creates a directory for user-specific data.
        let userDirectory: string = '';

        if (process.env.NODE_ENV === 'production') {
            userDirectory = `/home/admin/domains/freehumans.world/users/${newUser}`;
        } else {
            userDirectory = `/users/${newUser}`;
        }

        createUserDirectory(newUser);

        // Responds with the transaction result indicating successful account creation.
        //return result;
        console.log(pvt_key);
        return 'User saved in DB, Blockchain Account Created, Shares sent.'
    } catch (e) {
        //console.error('\nCaught exception: ', e);
        if (e instanceof RpcError) {
            return { 'message': e.details[0].message }
        } else {
            return { message: "An unknown error occurred." };
        }
    }
};

async function saveUserData(
    email: string,
    username: string,
    invitedby: string | null
): Promise<void> {
    try {
        // Check if the email is already in use
        const emailQuery = 'SELECT email FROM users WHERE email = ?';
        const emailResult = await db.execute(emailQuery, [email], { prepare: true });
        if (emailResult.rowLength > 0) {
            throw new Error('Email already in use.');
        }

        // Check if the username is already registered
        const userQuery = 'SELECT username FROM users WHERE username = ?';
        const userResult = await db.execute(userQuery, [username], { prepare: true });
        if (userResult.rowLength > 0) {
            throw new Error('User already registered.');
        }

        // Insert new user data, including invitedBy which now directly stores the username
        const insertQuery = `
            INSERT INTO users (userid, email, username, invitedby, registrationdate)
            VALUES (uuid(), ?, ?, ?, toTimeStamp(now()));
        `;
        await db.execute(insertQuery, [email, username, invitedby], { prepare: true });

        console.log('User data inserted successfully.');
    } catch (err) {
        console.error('Failed to insert user data:', err);
        throw err;
    }
}



// Get session token without IP
async function getSessionToken(username: string) {
    try {
        // Step 1: Get session by IP address to retrieve all session info
        const sessionQuery = 'SELECT token_string FROM session WHERE username = ?';
        const sessionResult = await db.execute(sessionQuery, [username], { prepare: true });

        let sessionFoundAndValid = false;

        let token;

        // Check if there's a session that matches the token
        sessionResult.rows.forEach(row => {
            sessionFoundAndValid = true;
            token = row.token_string;
        });

        if (!sessionFoundAndValid) {
            return { token: undefined, message: 'Token not found.' };
        }

        return { token: token }

    } catch (error) {
        console.error('Error checking session:', error);
        return { token: undefined, message: 'Internal server error.' };
    }
}



// Get session token by IP
async function getSessionTokenByIP(ipAddress: string, username: string) {
    try {
        // Step 1: Get session by IP address to retrieve all session info
        const sessionQuery = 'SELECT token_string FROM session WHERE ip_address = ? AND username = ?';
        const sessionResult = await db.execute(sessionQuery, [ipAddress, username], { prepare: true });

        let sessionFoundAndValid = false;

        let token;

        // Check if there's a session that matches the token
        sessionResult.rows.forEach(row => {
            sessionFoundAndValid = true;
            token = row.token_string;
        });

        if (!sessionFoundAndValid) {
            return { token: undefined, message: 'Session not found or does not match login attempt.' };
        }

        return { token: token }

    } catch (error) {
        console.error('Error checking session:', error);
        return { token: undefined, message: 'Internal server error.' };
    }
}


const getUserID = async (username: string) => {
    const userIDQuery = 'SELECT userid FROM users WHERE username = ?';

    try {
        const userIDResult = await db.execute(userIDQuery, [username]);
        if (userIDResult.rows.length === 0) {
            return { error: `No user found with username: ${username}` };
        }
        return { userID: userIDResult.rows[0]['userid'] };
    } catch (err) {
        console.error('Error processing login:', err);
        return { error: 'Error retrieving user ID. Please try again.' };
    }
}



const reconstructionCheck = async (userID: string, secret: string, sessionToken: string | undefined) => {
    if (!secret) {
        console.error('Missing user secret');
        return undefined;
    }

    if (!sessionToken) {
        console.error('Missing session token, defaulting to empty string');
        sessionToken = '';
    }

    // Get PrivateKeyShare from pvt_app table by UserID
    let combinedPrivateKey: string | null;
    const dbKeyShareQuery = 'SELECT PrivateKeyShare FROM pvt_app WHERE userid = ?';
    const dbKeyShareResult = await db.execute(dbKeyShareQuery, [userID]);
    const dbPrivateKeyShare = dbKeyShareResult.rows[0]['privatekeyshare'];

    // Decrypt user secret share
    let userShare: string | null

    userShare = decryptString(secret, sessionToken);

    // Combine the shares using the deshamir function
    combinedPrivateKey = await deshamir(userShare, dbPrivateKeyShare);
    userShare = null;

    if (!combinedPrivateKey) {
        return undefined;
    }

    // Check if username is associated with the private key on the blockchain
    const privateKey = Key.PrivateKey.fromString(combinedPrivateKey);
    combinedPrivateKey = null;
    const publicKey = privateKey.getPublicKey().toString();
    const response = await fetch("https://testnet-lightapi.eosams.xeos.me/api/key/" + publicKey);
    const data = await response.json();
    const associatedUsername = Object.keys(data.protontest.accounts)[0];

    return associatedUsername
}

export const removeSession = (app: Express) => {
    app.delete('/remove-session', createRateLimiter(15, 15), async (req, res) => {
        const username = req.query.username as string;  // Retrieved from query parameters
        const ip_address = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

        // Check if the required parameters are provided
        if (!username || !ip_address) {
            console.error('Missing username or IP address');
            return res.status(400).send({ error: 'Missing username or IP address.' });
        }

        const deleteSessionQuery = 'DELETE FROM session WHERE username = ? AND ip_address = ?';
        try {
            await db.execute(deleteSessionQuery, [username, ip_address]);
            console.log('Session entry deleted for user:', username);
            res.status(200).send({ message: 'Session successfully deleted.' });
        } catch (error) {
            console.error('Failed to delete session entry:', error);
            res.status(500).send({ error: 'Failed to delete session entry.' });
        }
    });
};



// LOGIN
export const login = (app: Express) => {
    app.post('/login', createRateLimiter(15, 15), async (req, res) => {
        const userName = req.body.user as string;
        const secret = req.body.secret as string;
        const ip_address = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

        try {
            const userResult = await getUserID(userName);
            if (userResult.error) {
                return res.status(400).send({ message: userResult.error });
            }

            const userID = userResult.userID;
            const sessionToken = await getSessionTokenByIP(ip_address, userName);

            if (!sessionToken.token) {
                return res.status(400).send({ message: 'Invalid session.' });
            }

            try {
                const faultQuery = 'SELECT * FROM user_fault WHERE userid = ?';
                const result = await db.execute(faultQuery, [userID], { prepare: true });
                const users = result.rows;
                const faults = users.filter(user => user.ban || user.prison);

                if (faults.length > 0) {
                    return res.status(400).send({ faults: faults[0] });
                }

                const associatedUsername = await reconstructionCheck(userID, secret, sessionToken.token);

                if (associatedUsername !== userName) {
                    return res.status(400).json({ message: 'Credentials provided do not match.' });
                }

                try {
                    const updateSessionQuery = 'UPDATE session SET authenticated = true WHERE username = ? AND ip_address = ? AND token_string = ?';
                    await db.execute(updateSessionQuery, [userName, ip_address, sessionToken.token], { prepare: true });
                    console.log('Login successful for user:', userName);
                    return res.send({ userName: userName, userID: userID });
                } catch (error) {
                    console.error('Error updating session:', error);
                    return res.status(500).send({ message: 'Failed to update session.' });
                }

            } catch (error) {
                console.error('Error checking username:', error);
                return res.status(500).send({ message: 'Internal server error.' });
            }
        } catch (error) {
            console.error('Error processing login', error);
            return res.status(500).send({ message: 'Error processing login.' });
        }
    });
};



// IS AUTHENTICATED? METHOD
export const credentials = async (app: Express) => {
    app.post('/credentials', createRateLimiter(15, 15), async (req, res) => {
        // Extract request parameters
        const { userid, username, secret } = req.body;

        let sessionToken = await getSessionToken(username);

        try {
            // Calculate expiration limit (30 days ago)
            const currentDate = new Date();
            const expirationLimit = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Query session to check if token is valid
            const query = 'SELECT date, authenticated FROM session WHERE username = ? ALLOW FILTERING';
            const params = [username];
            const result = await db.execute(query, params, { prepare: true });

            // Check if session exists and token is still valid
            if (result.rowLength > 0) {
                const session = result.rows[0];
                const sessionDate = new Date(session.date);

                if (sessionDate > expirationLimit && session.authenticated === true) {
                    // Session's token is still valid and authenticated is true ...
                    // Check user faults
                    try {
                        const faultQuery = 'SELECT * FROM user_fault WHERE userid = ?';
                        const result = await db.execute(faultQuery, [userid], { prepare: true });
                        const users = result.rows;
                        const faults = users.filter(user => user.ban || user.prison);

                        if (faults.length > 0) {
                            // Respond accordingly if there are faults
                            return res.status(400).send({ faults: faults[0] });
                        }
                    } catch (error) {
                        console.error('Database query error:', error);
                        return res.status(500).send({ message: 'An error occurred while checking user faults.' });
                    }

                    // Finally, check if the private key reconstructs correctly for the username provided
                    const associatedUsername = await reconstructionCheck(userid, secret, sessionToken.token);

                    if (associatedUsername !== username) {
                        return res.status(400).json({ message: 'Credentials provided do not match.' });
                    }

                    return res.json({ authenticated: true, message: 'All credentials are valid.' });
                }
            }

            // Session does not exist or token has expired
            return res.status(401).json({ authenticated: false, message: 'Invalid or expired session credentials.' });
        } catch (error) {
            console.error('Error checking authentication:', error);
            return res.status(500).json({ authenticated: false, message: 'Error checking authentication.' });
        }
    });
};

// ADD ANOTHER METHOD FOR AUTHORIZATION where we expect the private share to be passed and we check if the user is authorized to perform the action, a separate method is required because we do not want to send the private share with every request, only when the user logs in and when the user wants to perform a sensitive action.

export const checkAuthorization = async (username: string, privateKeyShare: string) => {
    // Step 1: Get UserID from users table by UserName
    const userResult = await getUserID(username);
    if (userResult.error) {
        return { success: false, message: userResult.error };
    }

    const userID = userResult.userID;

    // Step 2: Check if the user is banned or in prison
    const faultQuery = 'SELECT * FROM user_fault WHERE userid = ?';
    const result = await db.execute(faultQuery, [userID], { prepare: true });
    const users = result.rows;
    const faults = users.filter(user => user.ban || user.prison);

    if (faults.length > 0) {
        return { success: false, message: 'User is banned or in prison.' };
    }

    // Step 3: Get PrivateKeyShare from pvt_app table by UserID
    let combinedPrivateKey: string | null;
    const privateKeyShareQuery = 'SELECT PrivateKeyShare FROM pvt_app WHERE userid = ?';
    const privateKeyShareResult = await db.execute(privateKeyShareQuery, [userID]);
    const dbPrivateKeyShare = privateKeyShareResult.rows[0]['privatekeyshare'];

    // Step 4: Combine the shares using the deshamir function
    combinedPrivateKey = await deshamir(privateKeyShare, dbPrivateKeyShare);

    if (!combinedPrivateKey) {
        return { success: false, message: 'Failed to combine private key shares.' };
    }

    // Step 5: Check if username is associated with the private key on the blockchain
    const privateKey = Key.PrivateKey.fromString(combinedPrivateKey);
    const publicKey = privateKey.getPublicKey().toString();
    const response = await fetch("https://testnet-lightapi.eosams.xeos.me/api/key/" + publicKey);
    const data = await response.json();
    const associatedUsername = Object.keys(data.protontest.accounts)[0];

    if (associatedUsername !== username) {
        return { success: false, message: 'Credentials provided do not match.' };
    }

    return true;
}


// SELECT COUNT(*) FROM session WHERE username = ? AND date < dateOf(now()) - 30 days;


// UPDATE session SET date = '2024-01-01 21:14:48.787+0000' WHERE username = 'test1515';

// INSERT SECRET SHARE FOR A USER
// INSERT INTO pvt_app(UserID, CreationDate, PrivateKeyShare) VALUES(c4471371-b6af-4392-9746-5261271ec442, '2024-03-01 21:14:48.787+0000', 'wPOlBbmUk3Eax13pbVMgji+l6hulE5Lq4d753BdrK2R0PCx0Gjusd56b+r/a8Ema0V6xzGtt4Ildew==');


// UPDATE users SET level = 2 WHERE userid = c4471371-b6af-4392-9746-5261271ec442;
// INSERT INTO user_fault (userid, ban) VALUES (c4471371-b6af-4392-9746-5261271ec442, 'yes');

// UPDATE session SET authenticated = false WHERE username = 'test1515';

// ALTER TABLE users ADD Title text;
// UPDATE users SET xp = 230 WHERE userid = c4471371-b6af-4392-9746-5261271ec442;
// INSERT INTO progression (userid, titles, level, xp) VALUES(c4471371-b6af-4392-9746-5261271ec442, {'Newb'}, 1, 0);
// UPDATE progression SET connections = connections + {'okapi'} WHERE userID = c4471371-b6af-4392-9746-5261271ec442;

// TESTING METHODS BELOW

// TEST FUNCTION
export const test = (app: Express) => {
    app.get('/test', createRateLimiter(15, 15), async (req, res) => {
        const privateKey = Key.PrivateKey.fromString(defaultPrivateKey);
        const publicKey = privateKey.getPublicKey().toString();
        const response = await fetch("https://testnet-lightapi.eosams.xeos.me/api/key/" + publicKey);
        const data = await response.json();
        console.log(Object.keys(data.protontest.accounts)[0]);
    });
};




// 10 exotic animal usernames
const usernames = [
    'axolotl',
    'okapi',
    'quokka',
    'fossa',
    'narwhal',
    'ayeaye',
    'platypus',
    'sundacolugo',
    'blobfish',
    'mantisshrimp'
];

const fullNames = usernames.map(username => `${username.charAt(0).toUpperCase() + username.slice(1)} Smith`);

const languages = ['EN', 'FR', 'ES', 'DE', 'IT', 'PT', 'RU', 'ZH', 'JA', 'KO'];

// create emails array
const emails = usernames.map(username => `${username}@freehumans.world`);

// create a scylladb query to add these users to the users table

const insertUsersQuery = `
INSERT INTO users (userid, email, username, invitedby, registrationdate, lang, fullname)
VALUES (uuid(), ?, ?, ?, toTimeStamp(now()), ?, ?);
`;

// insert the users into the database
export const insertUsers = async (emails: string[], usernames: string[], fullNames: string[]) => {
    try {
        for (let i = 0; i < usernames.length; i++) {
            const email = emails[i];
            const username = usernames[i];
            const fullName = fullNames[i];
            const language = languages[Math.floor(Math.random() * languages.length)]; // Select a random language from the array
            await db.execute(insertUsersQuery, [email, username, 'grat', language, fullName], { prepare: true });
        }
        console.log('Users inserted successfully.');
    } catch (err) {
        console.error('Failed to insert users:', err);
    }
}


//insertUsers(emails, usernames, fullNames).catch(console.error);

// CREATE A POST METHOD TO ADD USERNAMES FROM POSTMAN
//addUsers to 'add-users' endpoint

export const addUsers = (app: Express) => {
    app.post('/add-users', createRateLimiter(15, 15), async (req, res) => {
        insertUsers(emails, req.body.usernames, fullNames).catch(console.error);
        console.log(usernames);
        res.send({ message: 'Users added successfully.' });
    });
};



// CHECK USER FAULTS IN user_fault table

export const checkUserFaults = (app: Express) => {
    app.post('/checkfault', createRateLimiter(15, 15), async (req, res) => {
        const user = req.body.username;
        const userid = req.body.userid;
        const sessionToken = req.body.token;
        //console.log(user, userid, sessionToken);

        const query = 'SELECT * FROM user_fault WHERE userid = ?';

        // table columns: userid | ban | penalty | prison
        try {
            const result = await db.execute(query, [userid], { prepare: true });
            const users = result.rows;
            const faults = users.filter(user => user.ban || user.penalty || user.prison);
            res.send({ faults });
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).send({ message: 'An error occurred while checking user faults.' });
        }
    });

    // test function to add faults to the user_fault table
    app.post('/add-fault', createRateLimiter(15, 15), async (req, res) => {
        const { userid, ban, penalty, prison } = req.body;
        const query = 'INSERT INTO user_fault (userid, ban, penalty, prison) VALUES (?, ?, ?, ?)';

        try {
            await db.execute(query, [userid, ban, penalty, prison], { prepare: true });
            res.send({ message: 'Faults added successfully.' });
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).send({ message: 'An error occurred while adding user faults.' });
        }
    });
}

// UPDATE UI TO SHOW CORRECT USERNAME AND NAME ON PROFILE PAGE
// DONE


// CONNECT FUNCTIONALITY (update in the database and display status on the UI)

// FOLLOW FUNCTIONALITY (update in the database and display status on the UI)

