
import { Express } from 'express';
import { createRateLimiter } from '../middleware/limiter';
import { randomBytes } from 'crypto';
import db from '../utils/scylladb';

// Session Token expiration times in minutes
const token_expiration: { [key: string]: number } = {
    reg: 15,
    temp: 1440,
    long: 43200
};

// Generate a random token
function generateRandomToken(): string {
    return randomBytes(8).toString('hex'); // Generates a unique token of 16 characters
}

export const generateToken = (app: Express) => {
    app.get('/generate-token', createRateLimiter(15, 15), async (req, res) => {
        const purpose = req.query.purpose as string;
        const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!purpose) {
            return res.status(400).send('Missing purpose');
        }

        const currentDate = new Date();
        const expirationLimit = new Date(currentDate.getTime() - 15 * 60000); // 15 minutes ago

        try {
            const queryFindSession = 'SELECT token_string, date FROM session WHERE ip_address = ?';
            const existingSessionResult = await db.execute(queryFindSession, [ip_address]);

            if (existingSessionResult.rowLength > 0) {
                const session = existingSessionResult.rows[0];
                const sessionDate = new Date(session.date);

                if (sessionDate > expirationLimit) {
                    // Session's token is still valid
                    return res.json({ token: session.token_string, message: 'Existing token is still valid.' });
                }
            }

            // Generate a new token and update or insert the session
            const newToken = generateRandomToken();
            const queryUpsertSession = 'INSERT INTO session (ip_address, token_string, purpose, date) VALUES (?, ?, ?, ?)';
            await db.execute(queryUpsertSession, [ip_address, newToken, purpose, currentDate]);

            res.json({ token: newToken, message: 'New token generated.' });
        } catch (error) {
            console.error('Error handling token generation', error);
            res.status(500).send('Error generating token');
        }
    });
};



