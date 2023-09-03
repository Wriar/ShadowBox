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
 * //You may optionally pass a 3rd parameter to specify the IV. If not specified, a random IV will be generated.
 * const encryptedText = await aesEncryptText("eating a burger with no honey mustard", "Lilith");
 * console.log(`Encrypted: ${encryptedText}`);
 * ```
 * @param {String} text Plaintext to Encrypt
 * @param {String} password Any-Length Password to encrypt with
 * @param {Buffer} [iv=crypto.randomBytes(16)] Initialization Vector to use for encryption. (Default: ``crypto.randomBytes(16)``)
 * @returns {String} Encrypted Text in a Promise. Offered in format ``<IV As Hex>:<EncryptedData>``
 */
async function aesEncryptText(text, password, iv = crypto.randomBytes(16)) {
    return new Promise((resolve, reject) => {
        //Check to see if IV is a Buffer
        if (!Buffer.isBuffer(iv)) {
            reject(new Error('IV must be a Buffer.'));
            return;
        }
        crypto.scrypt(password, 'salt', 32, (err, key) => {
            if (err) {
                reject(err);
                return;
            }
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


const IV_BUFFER_ALLOC_SIZE = 16; //Allocate 16 bytes for the IV buffer.
const AES_ALGORITHM = 'aes-256-cbc'; //AES-256-CBC Algorithm using 16-byte IV.
const AES_KEY_SIZE = 32; //AES-256-CBC Key Size in Bytes.


/**
 * Asynchronous SB Implementation that Encrypts an Incoming FileStream using ``AES-256-CBC``
 * 
 * Provided a (default) 32-byte secret designated for ``AES-256-CBC``, encrypt an incoming stream and write it to an output stream with encrypted data.
 * A (default) 16-byte IV is generated and written to the output stream head so that it may be used later.
 * 
 * Usage Example:
 * ```js
 * import { aesEncryptFileStream } from './cryptography.js';
 * 
 * aesEncryptFileStream(inputStream, outputStream, MY_SECRET).then((iv) => {
 *     console.log("Generated IV " + iv.toString('hex'));
 *     file.resume(); // Consume the remaining stream if needed.
 * }).catch((err) => {
 *    console.error(err);
 * });
 * ```

 * @param {Stream} inputStream Input Stream to Encrypt
 * @param {Stream} outputStream Output Stream to Write Encrypted Data
 * @param {String} secret Secret (for AES-265-CBC length is 32 bytes) to encrypt incoming stream
 * @returns {Promise} Promise that resolves when the input stream has been encrypted and written to the output stream.
 */
async function aesEncryptFileStream(inputStream, outputStream, secret) {
    const algorithm = AES_ALGORITHM;
    const iv = crypto.randomBytes(IV_BUFFER_ALLOC_SIZE); // Initialization vector.

    const cipher = crypto.createCipheriv(algorithm, secret, iv);

    outputStream.write(iv); //Write IV to the output stream so it may be used later.
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

/**
 * Asynchronous SB Implementation that Decrypts an Incoming FileStream using ``AES-256-CBC``
 * 
 * Extracts the IV (default size specified by ``IV_BUFFER_ALLOC_SIZE = 32`` in bytes) that is written to the head of the input stream, and decrypts the rest of the stream using the provided secret.
 * 
 * Usage Example:
 * ```js
 * import { aesDecryptFileStream } from './cryptography.js';
 * 
 * aesDecryptFileStream(inputStream, outputStream, MY_SECRET).then(() => {
 *    console.log("Decryption Complete");
 * }).catch((err) => {
 *   console.error(err);
 * });
 * ```
 * @param {Stream} inputStream Input Stream to Decrypt
 * @param {Stream} outputStream Output Stream to Write Decrypted Data
 * @param {String} secret Secret (for AES-265-CBC length is 32 bytes) to decrypt incoming stream
 * @throws {Error} If the IV is not found in the input stream.
 * @returns {Promise} Promise that resolves when the input stream has been decrypted and written to the output stream.
 */
async function aesDecryptFileStream(inputStream, outputStream, secret) {
    const algorithm = AES_ALGORITHM;

    //Read the IV from the input stream.
    const iv = await new Promise((resolve, reject) => {
        inputStream.once('readable', () => {
            const iv = inputStream.read(IV_BUFFER_ALLOC_SIZE);
            if (iv) {
                resolve(iv);
            } else {
                reject(new Error("IV not found in input stream."));
            }
        });

        inputStream.on('error', (err) => {
            reject(err);
        });
    });

    let decipher = crypto.createDecipheriv(algorithm, secret, iv);


    return new Promise((resolve, reject) => {
        decipher.on('error', (err) => {
            console.error('Decryption error:', err.message);
            outputStream.end(); // End the output stream to gracefully terminate processing.
        });

        inputStream.pipe(decipher).pipe(outputStream);

        //Strip null bytes from the end of the stream.

        inputStream.on('end', () => {
            resolve();
        });

        inputStream.on('error', (err) => {
            console.warn("Error in input stream. Promise is rejected");
            reject(err);
        });
    });
}

export { aesEncryptText, aesDecryptText, aesDecryptFileStream, aesEncryptFileStream };

