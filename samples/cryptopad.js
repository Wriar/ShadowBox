/**
 * Test script for the cryptography module
 * 
 * Usage:
 * node cryptopad.js -opt <option>
 * 
 * Text Encrypt & Decrypt:
 * ``node cryptopad.js -opt txtcrypto -plain "Hello World!" -password "hunter2"``
 */

import { aesEncryptText, aesDecryptText } from '../src/cryptography.js';

//Begint to accept parameters
let selectedOption = process.argv[3];

console.log('\n');
const reset = "\x1b[0m";
const blue = "\x1b[34m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";

switch (selectedOption) {
    case "txtcrypto": {
        const PLAINTEXT = process.argv[5];
        const PASSWORD = process.argv[7];
        console.log(blue + `Encrypting: ${PLAINTEXT}` + reset);
        //Print first 2 characters of password, rest as asterisks, then the last 1 character.
        console.log(blue + `Password: ${PASSWORD.substring(0, 2)}${'*'.repeat(PASSWORD.length - 3)}${PASSWORD.substring(PASSWORD.length - 1)}` + reset);

        aesEncryptText(PLAINTEXT, PASSWORD).then((encryptedText) => {
            console.log(`${green} ==== BEGIN ENCRYPTED TEXT ==== ${reset}`);
            console.log(yellow + encryptedText + reset);
            console.log(`${green} ==== END ENCRYPTED TEXT ==== ${reset}`);
            aesDecryptText(encryptedText, PASSWORD).then((decryptedText) => {
                console.log(`${green} ==== BEGIN DECRYPTED TEXT ==== ${reset}`);
                console.log(yellow + decryptedText + reset);
                console.log(`${green} ==== END DECRYPTED TEXT ==== ${reset}`);
            }).catch((err) => {
                console.error(`Decryption Error! ${err}`);
            });
        }).catch((err) => {
            console.error(`Encryption Error! ${err}`);
        });
        break;
    }
    case "decrypt": {
        const ENCRYPTEDTEXT = process.argv[5];
        const PASSWORD = process.argv[7];
        console.log(blue + `Decrypting: ${ENCRYPTEDTEXT}` + reset);

        aesDecryptText(ENCRYPTEDTEXT, PASSWORD).then((decryptedText) => {
            console.log(`${green} ==== BEGIN DECRYPTED TEXT ==== ${reset}`);
            console.log(yellow + decryptedText + reset);
            console.log(`${green} ==== END DECRYPTED TEXT ==== ${reset}`);
        });
        break;
    }
    default: {
        console.warn("Invalid option selected.");
    }
}