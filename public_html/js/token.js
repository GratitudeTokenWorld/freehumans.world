export const url = 'http://' + location.hostname + ':5000/' //localhost
//export const url = 'https://' + location.hostname + ':5000/' //production

export const generateToken = (username, purpose) => {
    fetch(`${url}session-token?username=${username}&purpose=${purpose}`).then(response => {
        return response.json()
    }).then(data => {
        localStorage.setItem(purpose, data.token);
    }).catch(error => {
        console.log(error);
    })
}