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
const scylladb_1 = __importDefault(require("../utils/scylladb"));
const userController_1 = require("../../core/controllers/userController");
const getUserProfile = (app) => {
    app.get('/:username', (0, limiter_1.createRateLimiter)(100, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // Extract the username from the URL params
        const { username } = req.params;
        const usernameRegex = /^[a-zA-Z0-9_-]{4,12}$/;
        // Validate the username using the regex
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: 'Invalid username' });
        }
        // Query the database to find the user profile
        const query = 'SELECT city, country, fullname, lang, level, sex FROM users WHERE username = ?';
        try {
            const result = yield scylladb_1.default.execute(query, [username]);
            const rows = result.rows;
            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            const userData = rows;
            // Serve the profile template page
            // we need to add way more conditions here before we load the template like if this user is blocked by the current authenticated user and other checks
            // also if the user in the URL is the same as the authenticated user we should load a different template where the user can edit his profile
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
        // this is how we can check if the user is authenticated before allowing him to edit any entry
        if (!(0, userController_1.isAuthenticated)(username, token, purpose)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }));
};
exports.getUserProfile = getUserProfile;
