import express, { Express, Request, Response, NextFunction } from 'express';
import { generateSessionToken } from './core/utils/token';
import { checkUsernameAvailability, registerAccount, checkInviter, login, addUsers, checkUserFaults, removeSession, credentials, test, getTokens } from './core/controllers/userController';
import { getUserProfile } from './core/controllers/userProfile';
import { location, sendCode, verifyCode, checkEmail } from './core/controllers/emailController';
import { transfer } from './core/controllers/transfer';
import cors from 'cors';


// Create Express app for serving static files on port 80
const staticApp: Express = express();
const staticPort: number = 80;

// Middleware for serving static files
staticApp.use(express.static('public_html'));

// Start the server for serving static files
staticApp.listen(staticPort, () => console.log(`Static files server running on port ${staticPort}`));

// Create Express app for the rest of the routes on port 5000
const app: Express = express();
const port: number = 5000;

// Custom middleware to allow requests only from a specific hostname
function allowFromHostname(req: Request, res: Response, next: NextFunction) {
    const allowedHostname = 'localhost'; // replace with freehumans.world on Production
    const requestHostname = req.hostname;

    if (requestHostname === allowedHostname) {
        // If the request hostname matches the allowed hostname, proceed
        next();
    } else {
        // If the request hostname does not match, respond with a 403 Forbidden status
        res.status(403).send('Access forbidden');
    }
}

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(allowFromHostname); // Custom middleware for hostname validation

// Routes
getUserProfile(staticApp)
checkUserFaults(app);
addUsers(app);
generateSessionToken(app);
login(app);
removeSession(app);
credentials(app);
test(app);
getTokens(app);
location(app);
sendCode(app);
verifyCode(app);
checkUsernameAvailability(app);
registerAccount(app);
checkInviter(app);
checkEmail(app);
transfer(app);

// Start the server for the rest of the routes
app.listen(port, () => console.log(`App running on port ${port}`));
