import { Express } from 'express';
import { createRateLimiter } from '../middleware/limiter';
import { generateProfileTemplate } from '../templates/profile';
import { JsonRpc } from '@proton/js';
import db from '../utils/scylladb';
import { credentials } from '../../core/controllers/userController';

const endpoint = 'https://testnet.protonchain.com';
const rpc = new JsonRpc(endpoint);

export const getUserProfile = (app: Express) => {
    app.get('/:username', createRateLimiter(100, 15), async (req, res) => {

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
            const userResult = await db.execute(userQuery, [username]);
            if (userResult.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Extract the userID from user result
            const userID = userResult.rows[0].userid;

            // Use userID to query progression data
            const progressionResult = await db.execute(progressionQuery, [userID]);

            if (progressionResult.rows.length === 0) {
                // Handle the case where there is no progression data found for the user
                return res.status(404).json({ error: 'Progression data not found for user' });
            }

            // Merge user data with progression data
            let userData = { ...userResult.rows[0], ...progressionResult.rows[0] };

            // Extract the first title from the titles set if available
            userData.title = userData.titles ? userData.titles.values().next().value : null;
            delete userData.titles; // Remove titles set from userData as we only need the first title

            // Query external service for currency balance
            const balance = await rpc.get_currency_balance('grat', username, 'GRAT');
            userData = { ...userData, balance };

            // Serve the profile template page
            return res.status(200).send(generateProfileTemplate(username, userData));

        } catch (error) {
            console.error('Error querying the database:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

    });

    // Add a new route for editing the user profile
    app.get('/user-edit', createRateLimiter(100, 15), async (req, res) => {
        const { username, token, purpose, editRequest } = req.body;

        // check if the user is authenticated before allowing him to edit any entry
        // if (!credentials(username, token, purpose)) {
        //     return res.status(401).json({ error: 'Unauthorized' });
        // }
    });
}