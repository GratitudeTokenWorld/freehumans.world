export const url = 'http://' + location.hostname + ':5000/' //localhost
//export const url = 'https://' + location.hostname + ':5000/' //production

export const generateToken = async (username, purpose) => {
    const response = await fetch(`${url}session-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, purpose: purpose })
    });
    if (!response.ok) {
        throw new Error('Failed to fetch token');
    }
    const data = await response.json();

    if (data.token) {
        return data.token
    } else {
        return null
    }
};