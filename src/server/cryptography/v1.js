const crypto = require('crypto');

/**
 * Uses the ``crypto`` module to generate a 32 digit SHA512 Hashed Key from a password with hex digest.
 * 
 * **WARNING: The password is not salted and should only be used to convert the password to an 
 * AES256 key that should be kept similiarly secure as the password itself.**
 * 
 * @param {string} password User Password (any length).
 * @returns {string} 32 Digit SHA512 Hashed Key. 
 */
function derieve32DigitKey(password) {
    const hash = crypto.createHash('sha512').update(password).digest('hex');
    return hash.slice(0, 32);
}

/**
 * Encrypts a string using the AES-256-CBC algorithm with the given password.
 *
 * @param {string} str The string to encrypt.
 * @param {string} password The password to use for encryption.
 * @returns {string} The encrypted string.
 */
function encryptStringWithPassword(str, password) {
    // Generate a random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);

    // Create a Cipher using AES-256-CBC algorithm with the password and IV
    const cipher = crypto.createCipheriv('aes-256-cbc', password, iv);

    // Encrypt the input string
    const encryptedBuffer = Buffer.concat([cipher.update(str, 'utf-8'), cipher.final()]);

    // Concatenate the IV and the encrypted data as a base64-encoded string
    const encryptedString = iv.toString('hex') + encryptedBuffer.toString('base64');

    // Return the encrypted string
    return encryptedString;
}

/**
 * Decrypts a string that was encrypted using the `encryptStringWithPassword()` function.
 *
 * @param {string} encryptedString The encrypted string.
 * @param {string} password The password to use for decryption.
 * @returns {string} The decrypted string.
 */
function decryptStringWithPassword(encryptedString, password) {
    // Extract the IV and the encrypted data from the input string
    const iv = Buffer.from(encryptedString.slice(0, 32), 'hex');
    const encryptedData = Buffer.from(encryptedString.slice(32), 'base64');

    // Create a Decipher using AES-256-CBC algorithm with the password and IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', password, iv);
    try {
        // Decrypt the encrypted data
        const decryptedBuffer = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
        return decryptedBuffer.toString('utf-8');
    } catch (ex) {
        throw new Error('Incorrect password');
    }
}

/*
const password = 'i forgor 💀';

const digest = derieve32DigitKey(password);
const encrypted = encryptStringWithPassword('Hello World!', digest);
console.log("Encrypted String: " + encrypted);

const decryptPassword = 'i forgor 💀';
console.log(decryptStringWithPassword(encrypted, derieve32DigitKey(decryptPassword)));
*/

module.exports = {
    derieve32DigitKey,
    encryptStringWithPassword,
    decryptStringWithPassword
}

