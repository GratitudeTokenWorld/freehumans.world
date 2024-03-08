import { Client, auth } from 'cassandra-driver';

const dbUsername: string = process.env.DB_USERNAME || 'cassandra';
const dbPassword: string = process.env.DB_PASSWORD || 'cassandra';

// Create a ScyllaDB client instance
const db = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'genesis',
    authProvider: new auth.PlainTextAuthProvider(dbUsername, dbPassword), // Optional: Only if you're using authentication
});

// Connect to ScyllaDB
db.connect()
    .then(() => console.log('Connected to ScyllaDB'))
    .catch(e => console.error('Failed to connect to ScyllaDB', e));

// Export the connected client
export default db;