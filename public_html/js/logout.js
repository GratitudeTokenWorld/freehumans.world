export const url = `http://${location.hostname}:5000/`;  // Using template literals consistently

export const removeSession = async (username) => {
    try {
        const response = await fetch(`${url}remove-session?username=${username}`, {
            method: 'DELETE', // Specify the method
            headers: {
                'Content-Type': 'application/json',
                // Additional headers like authorization tokens can go here
            }
        });

        if (!response.ok) {
            throw new Error('Failed to remove session.');
        }

        console.log('Session removed successfully.');
        return await response.json(); // Or handle the response based on your needs
    } catch (error) {
        console.error('Error:', error.message);
    }
};