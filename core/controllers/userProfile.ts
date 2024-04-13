import { Express } from 'express';
import { createRateLimiter } from '../middleware/limiter';
import { generateProfileTemplate } from '../templates/profile';
import db from '../utils/scylladb';
import { isAuthenticated } from '../../core/controllers/userController';


export const getUserProfile = (app: Express) => {
    app.get('/:username', createRateLimiter(100, 15), async (req, res) => {
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
            const result = await db.execute(query, [username]);
            const rows = result.rows;
            if (rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            const userData = rows;

            // Serve the profile template page
            // we need to add way more conditions here before we load the template like if this user is blocked by the current authenticated user and other checks
            // also if the user in the URL is the same as the authenticated user we should load a different template where the user can edit his profile
            return res.status(200).send(generateProfileTemplate(username, userData));

        } catch (error) {
            console.error('Error querying the database:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Add a new route for editing the user profile
    app.get('/user-edit', createRateLimiter(100, 15), async (req, res) => {
        const { username, token, purpose, editRequest } = req.body;

        // this is how we can check if the user is authenticated before allowing him to edit any entry
        if (!isAuthenticated(username, token, purpose)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    });
}