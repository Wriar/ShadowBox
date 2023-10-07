import fs from "fs";
import crypto from "crypto";
import { aesEncryptText, aesDecryptText } from '../src/cryptography.js';


const input = fs.readFileSync('input.txt', "utf8").split(/\r?\n/);
const password = fs.readFileSync('passwords.txt', "utf8");
let resultArray = [];
console.log("Please wait...");
for (let i = 0; i < input.length; i++) {
    const inputElement = input[i];

    //Number of slashes is the directory depth
    const directoryDepth = inputElement.split("/").length - 1;

    //First column is a UUIDv4 generated from crypto
    const column1 = crypto.randomUUID();
    let column2 = "";
    //Second column is the encrypted file name
    await aesEncryptText(inputElement, password).then((encryptedText) => {
        column2 = encryptedText;
    });

    //Generate a random datetime between 1/1/2020 and 10/1/2023 in format 2020-08-02T22:04:10.143Z
    const start = new Date(2020, 0, 1);
    const end = new Date(2023, 9, 1);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    let column3 = randomDate.toISOString();

    await aesEncryptText(column3, password).then((encryptedText) => {
        column3 = encryptedText;
    });



    const column4 = directoryDepth;
    const column5 = "";

    resultArray.push(`${column1},${column2},${column3},${column4}, ${column5}`);


}
//Dump result array to output.txt file as csv
fs.writeFileSync('output.txt', resultArray.join('\n'), "utf8");
console.log("Done!");