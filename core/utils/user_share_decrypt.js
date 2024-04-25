"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptString = void 0;
const crypto_1 = require("crypto");
function decryptString(combinedEncrypted, key) {
    const combinedBuffer = Buffer.from(combinedEncrypted, 'base64');
    const iv = combinedBuffer.slice(0, 16); // Extract the IV
    const encryptedData = combinedBuffer.slice(16); // Extract the cipher text
    if (key.length !== 64) {
        throw new Error(`Invalid key length: Key must be exactly 64 hexadecimal characters (received ${key.length}).`);
    }
    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== 32) {
        throw new Error("Invalid binary key length: Key must decode to exactly 32 bytes.");
    }
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encryptedData);
    try {
        decrypted = Buffer.concat([decrypted, decipher.final()]);
    }
    catch (err) {
        // Properly type-check the error object before accessing properties
        if (err instanceof Error) {
            console.error('Decryption failed:', err.message);
            throw new Error('Decryption failed due to incorrect cipher or key: ' + err.message);
        }
        else {
            // Handle cases where the error is not an instance of Error
            console.error('Decryption failed due to an unknown error:', err);
            throw new Error('Decryption failed due to an unknown error');
        }
    }
    return decrypted.toString('utf8');
}
exports.decryptString = decryptString;
