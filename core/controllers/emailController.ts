// emailController.ts - Manages email - related functionalities, including sending validation codes and verifying them.
import { Express } from 'express';
import { createRateLimiter } from '../middleware/limiter';
//import { Pool, FieldPacket, RowDataPacket } from 'mysql2/promise';
//import { createPool } from '../utils/mysql';
//const pool: Pool = createPool('emailStuff');
import db from '../utils/scylladb';


import nodemailer from 'nodemailer';

function generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

import geoip from 'geoip-lite';

export const location = (app: Express) => {
    app.post('/location', createRateLimiter(10, 15), async (req, res) => {
        // Get the IP address from the request, handling potential undefined values
        // and converting localhost IPv6 address (::1) to IPv4 (127.0.0.1) as a fallback.
        // You might want to handle localhost differently or use a real IP for testing.
        let ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
        ip = ip || '127.0.0.1'; // Fallback to 127.0.0.1 if ip is still undefined

        // Use geoip-lite to look up the IP address
        const geo = geoip.lookup(ip);

        if (geo) {
            // Send back the city and country information
            res.json({
                city: geo.city,
                country: geo.country
            });
        } else {
            res.status(404).send('Location not found for the IP address.');
        }
    });
}


// Configure nodemailer SMTP transporter
const transporter = nodemailer.createTransport({
    host: "mail.freehumans.world",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "noreply@freehumans.world",
        pass: "XXX",
    },
});

// function setup to send email
function sendValidationEmail(email: string, code: string) {
    const mailOptions = {
        from: 'noreply@freehumans.world',
        to: email,
        subject: '${code} is your Validation Code',
        text: `Your <b>FreeHumans.World</b> validation code is:<br>
        <b style="font-size: 23px">${code}</b>`,
        // html: `<p>Your validation code is: <b>${code}</b></p>` // In case you want to send HTML email
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(`Error sending email: ${error}`);
        }
        console.log(`Email sent: ${info.response}`);
    });
};

// sends the email with the code
export const sendCode = (app: Express) => {
    app.get('/send-code', createRateLimiter(10, 15), async (req, res) => {
        const email: string = req.query.email as string;
        if (!email) {
            return res.status(400).send('Email address is required.');
        }

        const code = generateSixDigitCode();
        sendValidationEmail(email, code);

        // Note: Assuming the 'Date' column in ScyllaDB is of type 'timestamp'
        // and 'email' is the primary key or part of the primary key.
        const query = `
            INSERT INTO email_code (Email, Code, Date)
            VALUES (?, ?, toTimeStamp(now()))
        `;

        try {
            await db.execute(query, [email, code]);
            res.status(200).send('Validation code sent.');
        } catch (err) {
            console.error('Error inserting data in the database:', err);
            res.status(500).send('Failed to save validation code.');
        }
    });
};

export const verifyCode = (app: Express) => {
    app.get('/verify-code', createRateLimiter(10, 15), async (req, res) => {
        const email = req.query.email as string;
        const newCode = req.query.code as string;

        if (!email || !newCode) {
            return res.status(400).send('Email and code are required.');
        }

        const query = `SELECT Date FROM email_code WHERE Email = ?`;

        try {
            const result = await db.execute(query, [email], { prepare: true });

            // Calculate the timestamp for 15 minutes ago to compare
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

            if (result.rowLength > 0) {
                let row = result.first();
                const codeDate = new Date(row.date);

                if (codeDate > fifteenMinutesAgo) {
                    // If the code is valid, send a 200 status
                    res.status(200).send('Code is valid.');
                } else {
                    // If the code is expired
                    res.status(404).send('Code is invalid or expired.');
                }
            } else {
                // If no matching rows were found
                res.status(404).send('Code is invalid or expired.');
            }
        } catch (err) {
            console.error('Error querying database:', err);
            // If there's an error querying the database, send a 500 status
            res.status(500).send('Failed to verify code.');
        }
    });
};



export const checkEmail = (app: Express) => {
    app.get('/checkEmail', createRateLimiter(10, 15), async (req, res) => {
        const emailChecked: string = String(req.query.email || '');

        try {
            // Query the database for the email
            const result = await db.execute('SELECT email FROM users WHERE email = ?', [emailChecked]);

            // Check if any rows were returned, which means the email exists
            if (result.rowLength > 0) {
                // The email exists
                res.status(404).send({ message: 'Email exists.' });
            } else {
                // The email doesn't exist
                res.status(200).send({ message: 'Email is not registered.' });
            }
        } catch (error) {
            console.error('Database query error:', error);
            res.status(500).send({ message: 'An error occurred while checking the email.' });
        }
    });
};





// function setup to send Shamir's share to user email
function sendShareEmail(email: string, user: string, share: string) {
    const mailOptions = {
        from: 'noreply@freehumans.world',
        to: email,
        subject: 'Your Secure Key Share - Action Required',
        text: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Secure Key Share</title>
</head>

<body
    style="font-family: Helvetica, Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; line-height: 1.6;">
    <div>
        <h1>Welcome to FreeHumans.World</h1>
        <p>Dear @${user},</p>
        <p>Welcome to FreeHumans.World, where we prioritize your security, privacy and ownership above all. As part of
            our commitment to
            safeguarding your digital assets, we employ Shamir's Secret Sharing, a cutting-edge cryptographic technique,
            to protect
            your blockchain account's private key.</p>

        <h2>Key Share:</h2>
        <div
            style="display: inline-block; border: 1px solid gray; background-color: #bdbdbd; color: #bdbdbd; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all;">
            ${share}
        </div>
        <p style="font-size: 0.8em; color: #666; margin-top: 10px;"><b style="color: red">Please note:</b> The key share is displayed above in a
            way to
            discourage photographing the screen. Select the text to see it. Ensure to store it securely as instructed.
        </p>

        <h2>What is Shamir's Secret Sharing?</h2>
        <p>Shamir's Secret Sharing is a cryptographic method that splits a secret (in this case, your private key) into
            multiple
            parts, known as "shares." To reconstruct the original key, a specific number of shares must be combined. In
            our case,
            your key has been divided into three shares, ensuring that no single share can compromise your account.</p>

        <h2>Why Your Share is Important</h2>
        <p>
            You are receiving one of these three shares. It is crucial that you keep this share secure, as it is one
            part of the
            puzzle required to access your account for transactions and authorizations. The other two shares are stored
            separately
            for added security:
        </p>
        <ul>
            <li>One share is securely stored within the FreeHumans.World dApp database. This share alone cannot operate
                your blockchain
                account, as our system requires at least 2 out of 3 shares to temporarily reconstruct your account key.
            </li>
            <li>The final share is safeguarded on a different server, integral to our AI-based FaceID blackbox system.
                Only your face,
                verified through the app, can unlock this share.</li>
        </ul>

        <h2>How to Keep Your Share Safe</h2>
        <ul>
            <li><b>Multiple Copies:</b> Store your share in multiple safe locations. Consider using different mediums
                (e.g., a physical safe
                and a secure digital storage) to mitigate the risk of loss or damage.</li>
            <li><b>Keep It Confidential:</b> Your share is a key to your digital identity and assets. Do not share it
                with anyone.
                FreeHumans.World staff will never ask for your share.</li>
        </ul>

        <h2>Why This Matters</h2>
        <p>
            This approach ensures the highest level of security for your digital assets. Even in the unlikely event of a
            security
            breach, attackers cannot access your account with just one share.
        </p>

        <h2>Need Help?</h2>
        <p>
            If you have any questions or need assistance in securing your share, please don't hesitate to contact us at
            <b>support@freehumans.world</b>.
        </p>

        <p>Thank you for being an integral part of FreeHumans.World. Together, we're setting the standard for digital
            security and
            sovereignty for all humans in the UniVerse.</p>

        <p>With lots of gratitude tokens,<br><b>The FreeHumans.World Network</b></p>
    </div>
</body>

</html>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(`Error sending email: ${error}`);
        }
        console.log(`Email sent: ${info.response}`);
    });
};

// saves 2 shamir shares in different locations and sends the email with the user owned Shamir share
export const sendShares = async (email: string, user: string, s1: string, s2: string, s3: string) => {
    if (!email) {
        return 'Email address is required.';
    }

    if (!user) {
        return 'Username is required.';
    }

    if (!s1 || !s2 || !s3) {
        return 'Some or all of the shares are missing.';
    }

    try {
        // Query the database to fetch the UserID based on the username
        const userQuery = 'SELECT userid FROM users WHERE username = ?';
        const userResult = await db.execute(userQuery, [user], { prepare: true });

        if (userResult.rowLength === 0) {
            throw new Error('User does not exist.');
        }

        const userID = userResult.first().userid; // Extracting userID from the result

        // Insert s1 into pvt_app
        const insertAppQuery = 'INSERT INTO pvt_app (userid, privatekeyshare, creationdate) VALUES (?, ?, toTimeStamp(now()))';
        await db.execute(insertAppQuery, [userID, s1], { prepare: true });

        // Insert s2 into pvt_faceid
        const insertFaceIdQuery = 'INSERT INTO pvt_faceid (userid, privatekeyshare, creationdate) VALUES (?, ?, toTimeStamp(now()))';
        await db.execute(insertFaceIdQuery, [userID, s2], { prepare: true });

        // Send s3 via email - ensure your sendShareEmail function is properly set up to handle this
        sendShareEmail(email, user, s3);

        return 'All 3 key shares were processed: 2 saved in different locations and 1 sent to the user email.';
    } catch (err) {
        console.error('Error handling in sendShares:', err);
        return 'Failed to process key shares. Please try again or contact support.';
    }
};
