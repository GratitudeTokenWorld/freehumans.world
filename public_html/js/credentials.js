import { url } from '/js/login.js';

// Check if user is authenticated
export const credentials = async () => {
    try {
        const response = await fetch(`${url}credentials`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: localStorage.getItem('authenticatedUser'),
                userid: localStorage.getItem('authenticatedUserID'),
                secret: localStorage.getItem('secret')
            })
        });

        console.log(await response.json());
    } catch (error) {
        console.error('Error executing request:', error);
        console.log('Unauthorized.');
    }
}