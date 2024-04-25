
import { Express } from 'express';
import { createRateLimiter } from '../middleware/limiter';
import { randomBytes } from 'crypto';
import db from '../utils/scylladb';

// Generate a random token
function generateToken() {
    // AES-256 requires a 256-bit key (32 bytes)
    const key = randomBytes(32);
    return key.toString('hex'); // Convert key to hexadecimal string
}

export const generateSessionToken = (app: Express) => {
    app.post('/session-token', createRateLimiter(15, 15), async (req, res) => {

        const purpose = req.body.purpose;  // Purpose is received but not used in the query
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
            const existingSessionResult = await db.execute(queryFindSession, [username, ip_address]);

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
            await db.execute(queryUpsertSession, [username, ip_address, newToken, currentDate]);

            res.json({ token: newToken, message: 'New token generated.' });
        } catch (error) {
            console.error('Error handling token generation', error);
            res.status(500).send('Error generating token');
        }
    });
};




