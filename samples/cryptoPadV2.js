import {aesEncryptText, aesDecryptText} from "../src/cryptography.js";
import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";

//Read password from passwords.txt
const PASSWORD = fs.readFileSync('passwords.txt', 'utf8');

if(!PASSWORD) {
    console.error("ERROR: Password not found in passwords.txt");
    process.exit(1);
}

//Prompt to either encrypt or decrypt
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Encrypt or Decrypt? (e/d): ", (answer) => {
    if(answer === "e") {
        rl.question("Enter plaintext: ", (plaintext) => {
            aesEncryptText(plaintext, PASSWORD).then((encryptedText) => {
                console.log(`Encrypted Text: ${encryptedText}`);
                process.exit(0);
            }).catch((err) => {
                console.error(`Encryption Error! ${err}`);
                process.exit(1);
            });
        });
    } else if(answer === "d") {
        rl.question("Enter encrypted text: ", (encryptedText) => {
            aesDecryptText(encryptedText, PASSWORD).then((decryptedText) => {
                console.log(`Decrypted Text: ${decryptedText}`);
                process.exit(0);
            }).catch((err) => {
                console.error(`Decryption Error! ${err}`);
                process.exit(1);
            });
        });
    } else {
        console.error("Invalid option selected.");
        process.exit(1);
    }
});