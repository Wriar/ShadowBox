/* eslint-disable no-unused-vars */
import crypto from 'crypto';

/**
 * Asynchronous SB Implementation that Encrypts a String using ``AES-256-CBC``
 * 
 * Provided a plaintext string and a password, this function will encrypt the plaintext string using ``AES-256-CBC`` and return the encrypted string in a Promise.
 * **Plaintext and Key may be any length.**
 * 
 * Usage Example:
 * ```js
 * import { aesEncryptText } from './cryptography.js';
 * const encryptedText = await aesEncryptText("eating a burger with no honey mustard", "Lilith");
 * console.log(`Encrypted: ${encryptedText}`);
 * ```
 * @param {String} text Plaintext to Encrypt
 * @param {String} password Plaintext to Decrypt
 * @returns {String} Encrypted Text in a Promise.
 */
async function aesEncryptText(text, password, iv) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, 'salt', 32, (err, key) => {
            if (err) {
                reject(err);
                return;
            }

            //const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encryptedData = cipher.update(text, 'utf-8', 'hex');
            encryptedData += cipher.final('hex');
            const encryptedText = `${iv.toString('hex')}:${encryptedData}`;
            resolve(encryptedText);
        });
    });
}

/**
 * Asynchronous SB Implementation that Decrypts a String using ``AES-256-CBC``
 * 
 * Provided an encrypted string and a password, this function will decrypt the encrypted string using ``AES-256-CBC`` and return the decrypted string in a Promise.
 * **Key may be any length. Promise will be rejected if password is incorrect.**
 * 
 * Usage Example:
 * ```js
 * import { aesDecryptText } from './cryptography.js'
 * aesDecryptText(encryptedText, "Lilith").then((decryptedText) => {
 *      console.log('Decrypted: ', decryptedText);
 * }).catch((err) => {
 *      console.error(`Decryption Error! ${err}`);
 * });
 * ```
 * @param {String} encryptedText Encrypted Text to Decrypt
 * @param {String} password Plaintext to Decrypt
 * @returns {String} Decrypted Text in a Promise.
 * @throws {Error} If the password is incorrect.
*/
async function aesDecryptText(encryptedText, password) {
    return new Promise((resolve, reject) => {
        const [ivHex, encryptedData] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');

        crypto.scrypt(password, 'salt', 32, (err, key) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
                decryptedData += decipher.final('utf-8');
                resolve(decryptedData);
            } catch (decryptError) {
                reject(new Error('Incorrect password or corrupted data.'));
            }
        });
    });
}


async function aesEncryptFileStream(inputStream, outputStream, secret, iv) {
    const algorithm = 'aes-256-cbc';
    //const iv = crypto.randomBytes(16); // Initialization vector.

    const cipher = crypto.createCipheriv(algorithm, secret, iv);

    return new Promise((resolve, reject) => {
        inputStream.pipe(cipher).pipe(outputStream);

        inputStream.on('end', () => {
            resolve(iv);
        });

        inputStream.on('error', (err) => {
            reject(err);
        });
    });
}

async function aesDecryptFile(inputStream, outputStream, iv, secret) {
    const algorithm = 'aes-256-cbc';

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret), iv);

    return new Promise((resolve, reject) => {
        inputStream.pipe(decipher).pipe(outputStream);

        inputStream.on('end', () => {
            resolve();
        });

        inputStream.on('error', (err) => {
            reject(err);
        });
    });
}

export { aesEncryptText, aesDecryptText, aesDecryptFile, aesEncryptFileStream };

