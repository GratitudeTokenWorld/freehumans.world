// Sets up the MySQL connection pool and exports a function or class for database operations.

import mysql from 'mysql2/promise';

// Define the type for the pool configuration
interface PoolConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    waitForConnections: boolean;
    connectionLimit: number;
    queueLimit: number;
}

// Create a function to initialize and return a connection pool
export const createPool = (poolName: string): mysql.Pool => {
    // Configure the pool based on your environment
    const config: PoolConfig = process.env.NODE_ENV === 'production' ? {
        host: 'localhost',
        user: 'admin_w3x',
        password: 'cocolino',
        database: 'admin_free',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    } : {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'freehumans.world',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };

    // Create and return the pool
    const pool: mysql.Pool = mysql.createPool(config);
    pool.getConnection().then(connection => {
        console.log('Established: MySQL Connection Pool name: ' + poolName);
        connection.release(); // Release the connection back to the pool
    }).catch(err => {
        console.error('Error connecting to the database:', err);
    });

    return pool;
};