import { $ } from '/js/selectors.js';
export const url = `http://${location.hostname}:5000/`;  // Using template literals consistently

import { removeSession } from '/js/logout.js';
import { generateToken } from '/js/token.js';
import { encryptString } from '/js/encrypt.js';

// Function to authenticate every action
export const authenticateUser = async (user, secret_share) => {

    let newToken = await generateToken(user, 'session');

    if (!newToken) {
        // we already have credentials stored in localStorage
        if (localStorage.getItem('secret') && localStorage.getItem('authenticatedUser') && localStorage.getItem('authenticatedUserID')) {
            console.log('Already authenticated.');
            window.location = `/${user}`;
        } else {
            // we can't find the secret stored on this machine
            removeSession(user);
            loader.classList.remove('show');
            alert('Looks like your secret is missing. Try to authenticated again.')
        }

    } else {
        // fresh login
        encryptString(secret_share, newToken).then(async encrypted => {
            try {
                const response = await fetch(`${url}login`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: user,
                        secret: encrypted  // send concatenated encryptedData and iv
                    })
                });

                if (!response.ok) {
                    // Handles non-2xx responses
                    const errorData = await response.json(); // Assuming the server sends a JSON response for errors
                    console.error('Login failed:', errorData.message || 'Unknown error occurred');
                    alert(`Login failed: ${errorData.message}`);
                    localStorage.clear();
                    return; // Exit function early on error
                }

                const data = await response.json(); // Correctly waiting for JSON data

                if (data.userName && data.userName === user) {
                    localStorage.setItem('secret', encrypted);
                    localStorage.setItem('authenticatedUserID', data.userID);
                    localStorage.setItem('authenticatedUser', user);
                    console.log(`Login successful: ${user} | ${data.userID}`);
                    $('.overlay').style.display = 'none';
                    window.location = `/${user}`;
                } else {
                    localStorage.clear();
                    alert('User not authenticated. Please try again.');
                }
            } catch (error) {
                console.error('Error during fetch or data processing', error);
                localStorage.clear();
                alert('Login failed. Please try again.');
            }
        });
    }
};
