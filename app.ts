import express, { Express } from 'express';
import { generateToken } from './core/utils/token';
import { checkUsernameAvailability, registerAccount, checkInviter, login } from './core/controllers/userController';
import { location, sendCode, verifyCode, checkEmail } from './core/controllers/emailController';
import { transfer } from './core/controllers/transfer';



const app: Express = express();
import cors from 'cors';
app.use(cors());
app.use(express.json());

const port: number = 5000;


generateToken(app);
login(app);

location(app);
sendCode(app);
verifyCode(app);

checkUsernameAvailability(app);
registerAccount(app);
checkInviter(app);
checkEmail(app);

transfer(app);


app.listen(port, () => console.log(`Server running on port ${port}`));
