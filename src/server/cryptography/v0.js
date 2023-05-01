/* eslint-disable no-unused-vars */
const crypto = require('crypto');


/**
 * Given a plaintext password, derieve an AES-256 Encryption Key.
 * @param {String} password Plaintext Password
 * @returns {Buffer} AES-256 Encryption Key
 */
async function derieveAES256KeyFromPassword(password) {
    const salt = crypto.randomBytes(32);
    const secretKey = crypto.randomBytes(32);

    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 100000, 32, 'sha512', (err, derievedKey) => {
            if (err) reject(err);

            const encryptionKey = Buffer.alloc(32);
            for (let i = 0; i < 32; i++) {
                encryptionKey[i] = derievedKey[i] ^ secretKey[i];
            }
            resolve(encryptionKey);
        });
    });
}

module.exports = {
    derieveAES256KeyFromPassword
}