"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const token_1 = require("./core/utils/token");
const userController_1 = require("./core/controllers/userController");
const userProfile_1 = require("./core/controllers/userProfile");
const emailController_1 = require("./core/controllers/emailController");
const transfer_1 = require("./core/controllers/transfer");
const cors_1 = __importDefault(require("cors"));
// Create Express app for serving static files on port 80
const staticApp = (0, express_1.default)();
const staticPort = 80;
// Middleware for serving static files
staticApp.use(express_1.default.static('public_html'));
// Start the server for serving static files
staticApp.listen(staticPort, () => console.log(`Static files server running on port ${staticPort}`));
// Create Express app for the rest of the routes on port 5000
const app = (0, express_1.default)();
const port = 5000;
// Custom middleware to allow requests only from a specific hostname
function allowFromHostname(req, res, next) {
    const allowedHostname = 'localhost'; // replace with freehumans.world on Production
    const requestHostname = req.hostname;
    if (requestHostname === allowedHostname) {
        // If the request hostname matches the allowed hostname, proceed
        next();
    }
    else {
        // If the request hostname does not match, respond with a 403 Forbidden status
        res.status(403).send('Access forbidden');
    }
}
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json()); // Parse JSON bodies
app.use(allowFromHostname); // Custom middleware for hostname validation
// Routes
(0, userProfile_1.getUserProfile)(staticApp);
(0, userController_1.checkUserFaults)(app);
(0, userController_1.addUsers)(app);
(0, token_1.generateSessionToken)(app);
(0, userController_1.login)(app);
(0, userController_1.isAuth)(app);
(0, userController_1.test)(app);
(0, emailController_1.location)(app);
(0, emailController_1.sendCode)(app);
(0, emailController_1.verifyCode)(app);
(0, userController_1.checkUsernameAvailability)(app);
(0, userController_1.registerAccount)(app);
(0, userController_1.checkInviter)(app);
(0, emailController_1.checkEmail)(app);
(0, transfer_1.transfer)(app);
// Start the server for the rest of the routes
app.listen(port, () => console.log(`App running on port ${port}`));
