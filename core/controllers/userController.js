"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserFaults = exports.addUsers = exports.insertUsers = exports.test = exports.checkAuthorization = exports.credentials = exports.login = exports.removeSession = exports.createPaidBlockchainAccount = exports.registerAccount = exports.checkInviter = exports.getTokens = exports.checkUsernameAvailability = void 0;
const limiter_1 = require("../middleware/limiter");
const path = __importStar(require("path"));
const fs_1 = require("fs");
const js_1 = require("@proton/js");
const scylladb_1 = __importDefault(require("../utils/scylladb"));
const shamir_1 = require("../utils/shamir"); // Shamir method
const deshamir_1 = require("../utils/deshamir"); // DeShamir method
const user_share_decrypt_1 = require("../utils/user_share_decrypt");
// Proton Keys Generator
const mnemonic_1 = require("@proton/mnemonic");
const defaultPrivateKey = ""; // 58 chars key, user test1515 on testnet // this should 
const signatureProvider = new js_1.JsSignatureProvider([defaultPrivateKey]);
// Setting up the Proton blockchain RPC and API with a given node endpoint and a signature provider.
const endpoint = 'https://testnet.protonchain.com';
const rpc = new js_1.JsonRpc(endpoint);
const api = new js_1.Api({ rpc, signatureProvider });
// Assuming newUser is the username for which the directory is being created
function createUserDirectory(newUser) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let userDirectory;
            if (process.env.NODE_ENV === 'production') {
                userDirectory = path.join('/home', 'admin', 'domains', 'freehumans.world', 'users', newUser);
            }
            else {
                // Adjust for your local development environment path as necessary
                userDirectory = path.join(__dirname, '../users', newUser); // Example for local development
            }
            yield fs_1.promises.mkdir(userDirectory, { recursive: true });
            console.log(`Directory created: ${userDirectory}`);
        }
        catch (error) {
            console.error(`Error creating directory: ${error}`);
        }
    });
}
const checkUsernameAvailability = (app) => {
    // Defines a GET endpoint to check username availability.
    // Apply the rate limiting middleware specifically to this route.
    app.get('/checkUsernameAvailability', (0, limiter_1.createRateLimiter)(100, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Retrieves the username query parameter and ensures it's a string.
        const userChecked = String(req.query.username || '');
        // Validate the username with regex
        const isValidUsername = /^[a-z1-5]{4,12}$/.test(userChecked);
        if (!isValidUsername) {
            return res.status(400).send('Username must be 4-12 characters long, including lowercase letters or digits 1-5.');
        }
        try {
            // Attempts to fetch account information from the blockchain.
            res.status(200).send(yield rpc.get_account(userChecked));
        }
        catch (e) {
            //console.error('\nCaught exception: ', e);
            if (e instanceof js_1.RpcError) {
                e.json.code === 500 ? res.send({ 'message': e.details[0].message }) : null;
            }
            else {
                // Handles non-RPC errors, indicating an unknown or unexpected error occurred.
                res.status(500).send({ message: "An unknown error occurred." });
            }
        }
    }));
};
exports.checkUsernameAvailability = checkUsernameAvailability;
const getTokens = (app) => {
    app.get('/getTokens', (0, limiter_1.createRateLimiter)(100, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const username = String(req.query.username || '');
        try {
            const gigi = yield rpc.get_currency_balance('grat', username, 'GRAT');
            // Attempts to fetch account information from the blockchain.
            res.send({ grat: parseInt(gigi[0]).toFixed(2) });
        }
        catch (e) {
            //console.error('\nCaught exception: ', e);
            if (e instanceof js_1.RpcError) {
                e.json.code === 500 ? res.send({ 'message': e.details[0].message }) : null;
            }
            else {
                // Handles non-RPC errors, indicating an unknown or unexpected error occurred.
                res.status(500).send({ message: "An unknown error occurred." });
            }
        }
    }));
};
exports.getTokens = getTokens;
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
const checkInviter = (app) => {
    app.get('/checkInviter', (0, limiter_1.createRateLimiter)(10, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userChecked = String(req.query.username || '');
        // Validate the username with regex
        const isValidUsername = /^[a-z1-5]{4,12}$/.test(userChecked);
        if (!isValidUsername) {
            return res.status(400).send('Username must be 4-12 characters long, including lowercase letters or digits 1-5.');
        }
        const query = 'SELECT UserName FROM users WHERE UserName = ?';
        try {
            const result = yield scylladb_1.default.execute(query, [userChecked], { prepare: true });
            // Check if any rows were returned, which means the username is taken
            if (result.rowLength > 0) {
                // The inviter exists
                res.status(200).send({ message: 'Inviter exists.', userChecked });
            }
            else {
                // The inviter does not exist
                res.status(404).send({ message: 'Inviter does not exist.' });
            }
        }
        catch (error) {
            console.error('Database query error:', error);
            res.status(500).send({ message: 'An error occurred while checking the inviter.' });
        }
    }));
};
exports.checkInviter = checkInviter;
const registerAccount = (app) => {
    app.post('/register-account', (0, limiter_1.createRateLimiter)(10, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, username, key, invitedby } = req.body;
        // Dynamic assignment of newUser based on 'username' or 'key'
        let newUser;
        let finalKey;
        // Generates a new key pair for the account, ensuring security.
        let mnemonic = new mnemonic_1.Mnemonic();
        const { publicKey, privateKey } = mnemonic.keyPairAtIndex(0);
        if (key) {
            finalKey = key;
            const privateKey = js_1.Key.PrivateKey.fromString(key);
            const publicKey = privateKey.getPublicKey().toString();
            const response = yield fetch("https://testnet-lightapi.eosams.xeos.me/api/key/" + publicKey);
            const data = yield response.json();
            newUser = Object.keys(data.protontest.accounts)[0];
        }
        else if (username) {
            newUser = username;
            finalKey = privateKey;
        }
        else {
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
            yield saveUserData(email, newUser, invitedby);
            // Await the blockchain account creation and capture the result
            const result = yield (0, exports.createPaidBlockchainAccount)(email, username, newUser, finalKey || '');
            // After successful account creation, the mnemonic (and thus the private key) is cleared from memory.
            mnemonic = null;
            // Respond with success and the blockchain creation result
            res.status(200).send({ message: 'Data saved successfully.', newUser, email, invitedby, result });
        }
        catch (error) {
            // Handle known and unknown errors
            if (error instanceof Error && error.message === 'User already registered.') {
                res.status(409).send({ error: 'User already registered.' });
            }
            else {
                console.error('Error:', error);
                res.status(500).send({ error: 'Failed to save user data or create blockchain account.' });
            }
        }
    }));
};
exports.registerAccount = registerAccount;
// Function to create a new account on the Proton blockchain with paid resources (RAM, CPU, and NET).
const createPaidBlockchainAccount = (email, user, newUser, pvt_key) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        else {
            (0, shamir_1.shamir)(email, user, pvt_key).catch(console.error);
        }
        // Optionally, creates a directory for user-specific data.
        let userDirectory = '';
        if (process.env.NODE_ENV === 'production') {
            userDirectory = `/home/admin/domains/freehumans.world/users/${newUser}`;
        }
        else {
            userDirectory = `/users/${newUser}`;
        }
        createUserDirectory(newUser);
        // Responds with the transaction result indicating successful account creation.
        //return result;
        console.log(pvt_key);
        return 'User saved in DB, Blockchain Account Created, Shares sent.';
    }
    catch (e) {
        //console.error('\nCaught exception: ', e);
        if (e instanceof js_1.RpcError) {
            return { 'message': e.details[0].message };
        }
        else {
            return { message: "An unknown error occurred." };
        }
    }
});
exports.createPaidBlockchainAccount = createPaidBlockchainAccount;
function saveUserData(email, username, invitedby) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the email is already in use
            const emailQuery = 'SELECT email FROM users WHERE email = ?';
            const emailResult = yield scylladb_1.default.execute(emailQuery, [email], { prepare: true });
            if (emailResult.rowLength > 0) {
                throw new Error('Email already in use.');
            }
            // Check if the username is already registered
            const userQuery = 'SELECT username FROM users WHERE username = ?';
            const userResult = yield scylladb_1.default.execute(userQuery, [username], { prepare: true });
            if (userResult.rowLength > 0) {
                throw new Error('User already registered.');
            }
            // Insert new user data, including invitedBy which now directly stores the username
            const insertQuery = `
            INSERT INTO users (userid, email, username, invitedby, registrationdate)
            VALUES (uuid(), ?, ?, ?, toTimeStamp(now()));
        `;
            yield scylladb_1.default.execute(insertQuery, [email, username, invitedby], { prepare: true });
            console.log('User data inserted successfully.');
        }
        catch (err) {
            console.error('Failed to insert user data:', err);
            throw err;
        }
    });
}
// Get session token without IP
function getSessionToken(username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Step 1: Get session by IP address to retrieve all session info
            const sessionQuery = 'SELECT token_string FROM session WHERE username = ?';
            const sessionResult = yield scylladb_1.default.execute(sessionQuery, [username], { prepare: true });
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
            return { token: token };
        }
        catch (error) {
            console.error('Error checking session:', error);
            return { token: undefined, message: 'Internal server error.' };
        }
    });
}
// Get session token by IP
function getSessionTokenByIP(ipAddress, username) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Step 1: Get session by IP address to retrieve all session info
            const sessionQuery = 'SELECT token_string FROM session WHERE ip_address = ? AND username = ?';
            const sessionResult = yield scylladb_1.default.execute(sessionQuery, [ipAddress, username], { prepare: true });
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
            return { token: token };
        }
        catch (error) {
            console.error('Error checking session:', error);
            return { token: undefined, message: 'Internal server error.' };
        }
    });
}
const getUserID = (username) => __awaiter(void 0, void 0, void 0, function* () {
    const userIDQuery = 'SELECT userid FROM users WHERE username = ?';
    try {
        const userIDResult = yield scylladb_1.default.execute(userIDQuery, [username]);
        if (userIDResult.rows.length === 0) {
            return { error: `No user found with username: ${username}` };
        }
        return { userID: userIDResult.rows[0]['userid'] };
    }
    catch (err) {
        console.error('Error processing login:', err);
        return { error: 'Error retrieving user ID. Please try again.' };
    }
});
const reconstructionCheck = (userID, secret, sessionToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!secret) {
        console.error('Missing user secret');
        return undefined;
    }
    if (!sessionToken) {
        console.error('Missing session token, defaulting to empty string');
        sessionToken = '';
    }
    // Get PrivateKeyShare from pvt_app table by UserID
    let combinedPrivateKey;
    const dbKeyShareQuery = 'SELECT PrivateKeyShare FROM pvt_app WHERE userid = ?';
    const dbKeyShareResult = yield scylladb_1.default.execute(dbKeyShareQuery, [userID]);
    const dbPrivateKeyShare = dbKeyShareResult.rows[0]['privatekeyshare'];
    // Decrypt user secret share
    let userShare;
    userShare = (0, user_share_decrypt_1.decryptString)(secret, sessionToken);
    // Combine the shares using the deshamir function
    combinedPrivateKey = yield (0, deshamir_1.deshamir)(userShare, dbPrivateKeyShare);
    userShare = null;
    if (!combinedPrivateKey) {
        return undefined;
    }
    // Check if username is associated with the private key on the blockchain
    const privateKey = js_1.Key.PrivateKey.fromString(combinedPrivateKey);
    combinedPrivateKey = null;
    const publicKey = privateKey.getPublicKey().toString();
    const response = yield fetch("https://testnet-lightapi.eosams.xeos.me/api/key/" + publicKey);
    const data = yield response.json();
    const associatedUsername = Object.keys(data.protontest.accounts)[0];
    return associatedUsername;
});
const removeSession = (app) => {
    app.delete('/remove-session', (0, limiter_1.createRateLimiter)(15, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const username = req.query.username; // Retrieved from query parameters
        const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        // Check if the required parameters are provided
        if (!username || !ip_address) {
            console.error('Missing username or IP address');
            return res.status(400).send({ error: 'Missing username or IP address.' });
        }
        const deleteSessionQuery = 'DELETE FROM session WHERE username = ? AND ip_address = ?';
        try {
            yield scylladb_1.default.execute(deleteSessionQuery, [username, ip_address]);
            console.log('Session entry deleted for user:', username);
            res.status(200).send({ message: 'Session successfully deleted.' });
        }
        catch (error) {
            console.error('Failed to delete session entry:', error);
            res.status(500).send({ error: 'Failed to delete session entry.' });
        }
    }));
};
exports.removeSession = removeSession;
// LOGIN
const login = (app) => {
    app.post('/login', (0, limiter_1.createRateLimiter)(15, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userName = req.body.user;
        const secret = req.body.secret;
        const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        try {
            const userResult = yield getUserID(userName);
            if (userResult.error) {
                return res.status(400).send({ message: userResult.error });
            }
            const userID = userResult.userID;
            const sessionToken = yield getSessionTokenByIP(ip_address, userName);
            if (!sessionToken.token) {
                return res.status(400).send({ message: 'Invalid session.' });
            }
            try {
                const faultQuery = 'SELECT * FROM user_fault WHERE userid = ?';
                const result = yield scylladb_1.default.execute(faultQuery, [userID], { prepare: true });
                const users = result.rows;
                const faults = users.filter(user => user.ban || user.prison);
                if (faults.length > 0) {
                    return res.status(400).send({ faults: faults[0] });
                }
                const associatedUsername = yield reconstructionCheck(userID, secret, sessionToken.token);
                if (associatedUsername !== userName) {
                    return res.status(400).json({ message: 'Credentials provided do not match.' });
                }
                try {
                    const updateSessionQuery = 'UPDATE session SET authenticated = true WHERE username = ? AND ip_address = ? AND token_string = ?';
                    yield scylladb_1.default.execute(updateSessionQuery, [userName, ip_address, sessionToken.token], { prepare: true });
                    console.log('Login successful for user:', userName);
                    return res.send({ userName: userName, userID: userID });
                }
                catch (error) {
                    console.error('Error updating session:', error);
                    return res.status(500).send({ message: 'Failed to update session.' });
                }
            }
            catch (error) {
                console.error('Error checking username:', error);
                return res.status(500).send({ message: 'Internal server error.' });
            }
        }
        catch (error) {
            console.error('Error processing login', error);
            return res.status(500).send({ message: 'Error processing login.' });
        }
    }));
};
exports.login = login;
// IS AUTHENTICATED? METHOD
const credentials = (app) => __awaiter(void 0, void 0, void 0, function* () {
    app.post('/credentials', (0, limiter_1.createRateLimiter)(15, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Extract request parameters
        const { userid, username, secret } = req.body;
        let sessionToken = yield getSessionToken(username);
        try {
            // Calculate expiration limit (30 days ago)
            const currentDate = new Date();
            const expirationLimit = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            // Query session to check if token is valid
            const query = 'SELECT date, authenticated FROM session WHERE username = ? ALLOW FILTERING';
            const params = [username];
            const result = yield scylladb_1.default.execute(query, params, { prepare: true });
            // Check if session exists and token is still valid
            if (result.rowLength > 0) {
                const session = result.rows[0];
                const sessionDate = new Date(session.date);
                if (sessionDate > expirationLimit && session.authenticated === true) {
                    // Session's token is still valid and authenticated is true ...
                    // Check user faults
                    try {
                        const faultQuery = 'SELECT * FROM user_fault WHERE userid = ?';
                        const result = yield scylladb_1.default.execute(faultQuery, [userid], { prepare: true });
                        const users = result.rows;
                        const faults = users.filter(user => user.ban || user.prison);
                        if (faults.length > 0) {
                            // Respond accordingly if there are faults
                            return res.status(400).send({ faults: faults[0] });
                        }
                    }
                    catch (error) {
                        console.error('Database query error:', error);
                        return res.status(500).send({ message: 'An error occurred while checking user faults.' });
                    }
                    // Finally, check if the private key reconstructs correctly for the username provided
                    const associatedUsername = yield reconstructionCheck(userid, secret, sessionToken.token);
                    if (associatedUsername !== username) {
                        return res.status(400).json({ message: 'Credentials provided do not match.' });
                    }
                    return res.json({ authenticated: true, message: 'All credentials are valid.' });
                }
            }
            // Session does not exist or token has expired
            return res.status(401).json({ authenticated: false, message: 'Invalid or expired session credentials.' });
        }
        catch (error) {
            console.error('Error checking authentication:', error);
            return res.status(500).json({ authenticated: false, message: 'Error checking authentication.' });
        }
    }));
});
exports.credentials = credentials;
// ADD ANOTHER METHOD FOR AUTHORIZATION where we expect the private share to be passed and we check if the user is authorized to perform the action, a separate method is required because we do not want to send the private share with every request, only when the user logs in and when the user wants to perform a sensitive action.
const checkAuthorization = (username, privateKeyShare) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Get UserID from users table by UserName
    const userResult = yield getUserID(username);
    if (userResult.error) {
        return { success: false, message: userResult.error };
    }
    const userID = userResult.userID;
    // Step 2: Check if the user is banned or in prison
    const faultQuery = 'SELECT * FROM user_fault WHERE userid = ?';
    const result = yield scylladb_1.default.execute(faultQuery, [userID], { prepare: true });
    const users = result.rows;
    const faults = users.filter(user => user.ban || user.prison);
    if (faults.length > 0) {
        return { success: false, message: 'User is banned or in prison.' };
    }
    // Step 3: Get PrivateKeyShare from pvt_app table by UserID
    let combinedPrivateKey;
    const privateKeyShareQuery = 'SELECT PrivateKeyShare FROM pvt_app WHERE userid = ?';
    const privateKeyShareResult = yield scylladb_1.default.execute(privateKeyShareQuery, [userID]);
    const dbPrivateKeyShare = privateKeyShareResult.rows[0]['privatekeyshare'];
    // Step 4: Combine the shares using the deshamir function
    combinedPrivateKey = yield (0, deshamir_1.deshamir)(privateKeyShare, dbPrivateKeyShare);
    if (!combinedPrivateKey) {
        return { success: false, message: 'Failed to combine private key shares.' };
    }
    // Step 5: Check if username is associated with the private key on the blockchain
    const privateKey = js_1.Key.PrivateKey.fromString(combinedPrivateKey);
    const publicKey = privateKey.getPublicKey().toString();
    const response = yield fetch("https://testnet-lightapi.eosams.xeos.me/api/key/" + publicKey);
    const data = yield response.json();
    const associatedUsername = Object.keys(data.protontest.accounts)[0];
    if (associatedUsername !== username) {
        return { success: false, message: 'Credentials provided do not match.' };
    }
    return true;
});
exports.checkAuthorization = checkAuthorization;
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
const test = (app) => {
    app.get('/test', (0, limiter_1.createRateLimiter)(15, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const privateKey = js_1.Key.PrivateKey.fromString(defaultPrivateKey);
        const publicKey = privateKey.getPublicKey().toString();
        const response = yield fetch("https://testnet-lightapi.eosams.xeos.me/api/key/" + publicKey);
        const data = yield response.json();
        console.log(Object.keys(data.protontest.accounts)[0]);
    }));
};
exports.test = test;
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
const insertUsers = (emails, usernames, fullNames) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (let i = 0; i < usernames.length; i++) {
            const email = emails[i];
            const username = usernames[i];
            const fullName = fullNames[i];
            const language = languages[Math.floor(Math.random() * languages.length)]; // Select a random language from the array
            yield scylladb_1.default.execute(insertUsersQuery, [email, username, 'grat', language, fullName], { prepare: true });
        }
        console.log('Users inserted successfully.');
    }
    catch (err) {
        console.error('Failed to insert users:', err);
    }
});
exports.insertUsers = insertUsers;
//insertUsers(emails, usernames, fullNames).catch(console.error);
// CREATE A POST METHOD TO ADD USERNAMES FROM POSTMAN
//addUsers to 'add-users' endpoint
const addUsers = (app) => {
    app.post('/add-users', (0, limiter_1.createRateLimiter)(15, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        (0, exports.insertUsers)(emails, req.body.usernames, fullNames).catch(console.error);
        console.log(usernames);
        res.send({ message: 'Users added successfully.' });
    }));
};
exports.addUsers = addUsers;
// CHECK USER FAULTS IN user_fault table
const checkUserFaults = (app) => {
    app.post('/checkfault', (0, limiter_1.createRateLimiter)(15, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.body.username;
        const userid = req.body.userid;
        const sessionToken = req.body.token;
        //console.log(user, userid, sessionToken);
        const query = 'SELECT * FROM user_fault WHERE userid = ?';
        // table columns: userid | ban | penalty | prison
        try {
            const result = yield scylladb_1.default.execute(query, [userid], { prepare: true });
            const users = result.rows;
            const faults = users.filter(user => user.ban || user.penalty || user.prison);
            res.send({ faults });
        }
        catch (error) {
            console.error('Database query error:', error);
            res.status(500).send({ message: 'An error occurred while checking user faults.' });
        }
    }));
    // test function to add faults to the user_fault table
    app.post('/add-fault', (0, limiter_1.createRateLimiter)(15, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userid, ban, penalty, prison } = req.body;
        const query = 'INSERT INTO user_fault (userid, ban, penalty, prison) VALUES (?, ?, ?, ?)';
        try {
            yield scylladb_1.default.execute(query, [userid, ban, penalty, prison], { prepare: true });
            res.send({ message: 'Faults added successfully.' });
        }
        catch (error) {
            console.error('Database query error:', error);
            res.status(500).send({ message: 'An error occurred while adding user faults.' });
        }
    }));
};
exports.checkUserFaults = checkUserFaults;
// UPDATE UI TO SHOW CORRECT USERNAME AND NAME ON PROFILE PAGE
// DONE
// CONNECT FUNCTIONALITY (update in the database and display status on the UI)
// FOLLOW FUNCTIONALITY (update in the database and display status on the UI)
