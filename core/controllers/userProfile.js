"use strict";
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
exports.getUserProfile = void 0;
const limiter_1 = require("../middleware/limiter");
const profile_1 = require("../templates/profile");
const js_1 = require("@proton/js");
const scylladb_1 = __importDefault(require("../utils/scylladb"));
const endpoint = 'https://testnet.protonchain.com';
const rpc = new js_1.JsonRpc(endpoint);
const getUserProfile = (app) => {
    app.get('/:username', (0, limiter_1.createRateLimiter)(100, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // must first check if user is authenticated considering we want the network exposed only to authenticated humans
        // credentials()
        // Extract the username from the URL params
        const { username } = req.params;
        const usernameRegex = /^[a-zA-Z0-9_-]{4,12}$/;
        // Validate the username using the regex
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: 'Invalid username' });
        }
        // Query the database to find the user profile
        const userQuery = 'SELECT userid, city, country, fullname, lang, sex FROM users WHERE username = ?';
        const progressionQuery = 'SELECT * FROM progression WHERE userID = ?';
        try {
            // Execute the query to get user data
            const userResult = yield scylladb_1.default.execute(userQuery, [username]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Extract the userID from user result
            const userID = userResult.rows[0].userid;
            // Use userID to query progression data
            const progressionResult = yield scylladb_1.default.execute(progressionQuery, [userID]);
            if (progressionResult.rows.length === 0) {
                // Handle the case where there is no progression data found for the user
                return res.status(404).json({ error: 'Progression data not found for user' });
            }
            // Merge user data with progression data
            let userData = Object.assign(Object.assign({}, userResult.rows[0]), progressionResult.rows[0]);
            // Extract the first title from the titles set if available
            userData.title = userData.titles ? userData.titles.values().next().value : null;
            delete userData.titles; // Remove titles set from userData as we only need the first title
            // Query external service for currency balance
            const balance = yield rpc.get_currency_balance('grat', username, 'GRAT');
            userData = Object.assign(Object.assign({}, userData), { balance });
            // Serve the profile template page
            return res.status(200).send((0, profile_1.generateProfileTemplate)(username, userData));
        }
        catch (error) {
            console.error('Error querying the database:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }));
    // Add a new route for editing the user profile
    app.get('/user-edit', (0, limiter_1.createRateLimiter)(100, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, token, purpose, editRequest } = req.body;
        // check if the user is authenticated before allowing him to edit any entry
        // if (!credentials(username, token, purpose)) {
        //     return res.status(401).json({ error: 'Unauthorized' });
        // }
    }));
};
exports.getUserProfile = getUserProfile;
