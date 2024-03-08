"use strict";
// Sets up the MySQL connection pool and exports a function or class for database operations.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
// Create a function to initialize and return a connection pool
const createPool = (poolName) => {
    // Configure the pool based on your environment
    const config = process.env.NODE_ENV === 'production' ? {
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
    const pool = promise_1.default.createPool(config);
    pool.getConnection().then(connection => {
        console.log('Established: MySQL Connection Pool name: ' + poolName);
        connection.release(); // Release the connection back to the pool
    }).catch(err => {
        console.error('Error connecting to the database:', err);
    });
    return pool;
};
exports.createPool = createPool;
