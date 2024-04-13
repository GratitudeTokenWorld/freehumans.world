import { $ } from '/js/selectors.js';
export const url = 'http://' + location.hostname + ':5000/' //localhost
//export const url = 'https://' + location.hostname + ':5000/' //production

import { generateToken } from '/js/token.js';

// Function to authenticate every action that is either a private user action or authorisation, a blockchain transaction or revealing private info
export const authenticateUser = (user, secret_share) => {
    generateToken(user, 'session');

    fetch(`${url}login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: localStorage.getItem('session'),
            user: user,
            secret: secret_share,
            purpose: 'session'
        })
    }).then(response => response.json()).then(data => {

        if (data.userName && data.userName === user) {
            localStorage.setItem('share', secret_share);
            localStorage.setItem('authenticatedUserID', data.userID);
            localStorage.setItem('authenticatedUser', user);
            console.log(`Login successful: ${user} | ${data.userID} | ${localStorage.getItem('session')}`);
            authentication.classList.add('hide');
            $('.overlay').style.display = '';
            window.location = `/${user}`;
        } else {
            console.log(data);
            alert('User not authenticated. Please try again.');
            loader.classList.remove('show');
        }

    }).catch(error => {
        console.log(error);
    })
} // this output's boolean