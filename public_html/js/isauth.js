import { url } from '/js/login.js';

// Check if user is authenticated
export const isAuthenticated = async () => {
    try {
        const response = await fetch(`${url}isauth`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: localStorage.getItem('authenticatedUser'),
                token: localStorage.getItem('session'),
                purpose: 'session'
            })
        });

        console.log(await response.json());
    } catch (error) {
        console.error('Error executing request:', error);
        console.log('Unauthenticated.');
    }
}