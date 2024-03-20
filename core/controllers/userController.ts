// userController.ts - Handles HTTP requests related to user operations, such as creating a user account, checking username availability, and validating user tokens.
import { Express } from 'express';
import { createRateLimiter } from '../middleware/limiter';
import * as path from 'path';
import { promises as fs } from 'fs';
import { Api, JsonRpc, RpcError, JsSignatureProvider,Key } from '@proton/js';
import db from '../utils/scylladb';
import { shamir } from '../utils/shamir'; // Shamir method

// Proton Keys Generator
import { Mnemonic } from '@proton/mnemonic';

const defaultPrivateKey: string = "PVT_K1_2FA8Af2BzBXVq2wVzgKZRrRDywzEW2ZKk9t7TDdyyqSLidgkTQ"; // 58 chars key, user test1515 on testnet // this should 
const signatureProvider: JsSignatureProvider = new JsSignatureProvider([defaultPrivateKey]);

// Setting up the Proton blockchain RPC and API with a given node endpoint and a signature provider.
const rpc = new JsonRpc('https://testnet.protonchain.com');
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
        const { email, username, invitedby } = req.body;
        const newUser = username;
        try {
            // Basic validations
            if (!newUser || newUser.length > 12) {
                return res.status(400).send({ error: "Username is required and must be less than 13 characters." });
            }

            if (!email) {
                return res.status(400).send({ error: "Email is required." });
            }

            // Save user data in the database
            await saveUserData(email, newUser, invitedby);

            // Await the blockchain account creation and capture the result
            const result = await createPaidBlockchainAccount(email, username, newUser);

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
export const createPaidBlockchainAccount = async (email: string, user: string, newUser: string) => {

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
        // Generates a new key pair for the account, ensuring security.
        let mnemonic: Mnemonic | null = new Mnemonic();
        const { publicKey, privateKey } = mnemonic.keyPairAtIndex(0);

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
        console.log(privateKey);
        // shamir the privateKey 
        shamir(email, user, privateKey).catch(console.error); //...now what ?

        // After successful account creation, the mnemonic (and thus the private key) is cleared from memory.
        mnemonic = null;

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
        console.log(privateKey);
        return 'gigi'
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




// LOGIN
export const login = (app: Express) => {
    app.post('/login', createRateLimiter(15, 15), async (req, res) => {
        const token = req.body.token as string;
        const userName = req.body.user as string; // UserName provided by the client
        const privateKeyShare = req.body.secret as string;
        const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const purpose = req.body.purpose as string;

        try {
            // Step 1: Match PrivateKeyShare to get UserID
            const userIDQuery = 'SELECT userid FROM pvt_app WHERE PrivateKeyShare = ?';
            const userIDResult = await db.execute(userIDQuery, [privateKeyShare]);

            if (userIDResult.rowLength === 0) {
                return res.status(400).send({ message: 'Invalid secret share' });
            }

            const privateKey = Key.PrivateKey.fromString(privateKeyShare);
            const publicDerived = privateKey.getPublicKey().toString();
            console.log (publicDerived)
            // Now we have to find where to get the account information from the public
            
            const userId = userIDResult.rows[0]['userid'];

            // Step 2: Verify UserName matches UserID in users table
            const userNameQuery = 'SELECT UserName FROM users WHERE UserID = ?';
            const userNameResult = await db.execute(userNameQuery, [userId]);

            if (userNameResult.rowLength === 0 || userNameResult.rows[0]['username'] !== userName) {
                return res.status(400).json({ message: 'UserName does not match secret share' });
            }

            // Step 3: Check session by IP address to retrieve all session info
            const sessionQuery = 'SELECT token_string, purpose, username FROM session WHERE ip_address = ?';
            const sessionResult = await db.execute(sessionQuery, [ip_address]);

            let sessionFoundAndValid = false;

            // Check if there's a session that matches the token and purpose
            sessionResult.rows.forEach(row => {
                if (row.token_string === token && row.purpose === purpose) {
                    sessionFoundAndValid = true;
                    // Proceed to update the username only if it's a match
                    if (row.username !== userName) {
                        const updateSessionQuery = 'UPDATE session SET username = ? WHERE ip_address = ?';
                        db.execute(updateSessionQuery, [userName, ip_address]);
                    }
                }
            });

            if (!sessionFoundAndValid) {
                return res.status(400).send({ message: 'Session not found or does not match login attempt' });
            }

            return res.send({ userName: userName });
        } catch (error) {
            console.error('Error processing login', error);
            return res.status(500).send({ message: 'Error processing login' });
        }
    });
};
