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
exports.generateSessionToken = void 0;
const limiter_1 = require("../middleware/limiter");
const crypto_1 = require("crypto");
const scylladb_1 = __importDefault(require("../utils/scylladb"));
// Generate a random token
function generateToken() {
    // AES-256 requires a 256-bit key (32 bytes)
    const key = (0, crypto_1.randomBytes)(32);
    return key.toString('hex'); // Convert key to hexadecimal string
}
const generateSessionToken = (app) => {
    app.post('/session-token', (0, limiter_1.createRateLimiter)(15, 15), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const purpose = req.body.purpose; // Purpose is received but not used in the query
        const username = req.body.username;
        const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (!username) {
            return res.status(400).send('Missing username.');
        }
        if (!purpose) {
            return res.status(400).send('Missing purpose.');
        }
        const currentDate = new Date();
        const expirationLimit = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        try {
            // Corrected query to include all necessary primary key components
            const queryFindSession = 'SELECT token_string, date FROM session WHERE username = ? AND ip_address = ? ALLOW FILTERING';
            const existingSessionResult = yield scylladb_1.default.execute(queryFindSession, [username, ip_address]);
            if (existingSessionResult.rowLength > 0) {
                const session = existingSessionResult.rows[0];
                const sessionDate = new Date(session.date);
                if (sessionDate > expirationLimit) {
                    // Session's token is still valid
                    return res.json({ message: 'Existing token is still valid.' });
                }
            }
            // Generate a new token and insert it into the session
            const newToken = generateToken(); // Ensure generateToken is correctly defined elsewhere
            const queryUpsertSession = 'INSERT INTO session (username, ip_address, token_string, date) VALUES (?, ?, ?, ?)';
            yield scylladb_1.default.execute(queryUpsertSession, [username, ip_address, newToken, currentDate]);
            res.json({ token: newToken, message: 'New token generated.' });
        }
        catch (error) {
            console.error('Error handling token generation', error);
            res.status(500).send('Error generating token');
        }
    }));
};
exports.generateSessionToken = generateSessionToken;
