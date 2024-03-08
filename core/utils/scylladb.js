"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cassandra_driver_1 = require("cassandra-driver");
const dbUsername = process.env.DB_USERNAME || 'cassandra';
const dbPassword = process.env.DB_PASSWORD || 'cassandra';
// Create a ScyllaDB client instance
const db = new cassandra_driver_1.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'genesis',
    authProvider: new cassandra_driver_1.auth.PlainTextAuthProvider(dbUsername, dbPassword), // Optional: Only if you're using authentication
});
// Connect to ScyllaDB
db.connect()
    .then(() => console.log('Connected to ScyllaDB'))
    .catch(e => console.error('Failed to connect to ScyllaDB', e));
// Export the connected client
exports.default = db;
