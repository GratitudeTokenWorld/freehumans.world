export const url = 'http://' + location.hostname + ':5000/' //localhost
//export const url = 'https://' + location.hostname + ':5000/' //production

// if no session token is generated, get one
if (!localStorage.getItem('session')) {
    fetch(`${url}generate-token?purpose=session`).then(response => {
        return response.json()
    }).then(data => {
        localStorage.setItem('session', data.token);
    }).catch(error => {
        console.log(error);
    })
}



// Function to authenticate every action that is either a private user action or authorisation, a blockchain transaction or revealing private info
export const authenticateUser = async (user, secret_share) => {
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
        if (data.userName === user) {
            localStorage.setItem('authenticatedUserID', data.userID);
            localStorage.setItem('authenticatedUser', user);
            return true
        } else {
            return false
        }
    }).catch(error => {
        console.log(error);
    })
} // this output's boolean