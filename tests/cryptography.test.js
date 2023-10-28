/* eslint-disable no-undef */
import { aesEncryptText, aesDecryptText, aesEncryptFileStream, aesDecryptFileStream } from '../src/cryptography.js';  //using the ES6 modules 
import crypto from 'crypto';
import fs from 'fs';

const testString = "Ah! I can't take it anymore! Eating a burger with no honey mustard. Eating a burger with no honey mustard. Eating a burger with no honey mustard! ";
const testPassword = 'Pa33w0rd23!';
const testIV = crypto.randomBytes(16);

const TMP_DIR = './tests/tmp';

beforeAll(() => {
    if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR);
    }
});


const plaintextFile = `${TMP_DIR}/plaintext.txt`;
const encryptedFile = `${TMP_DIR}/encrypted.enc`;
const decryptedFile = `${TMP_DIR}/decrypted.txt`;
// Create a random secret key for encryption

//Convert the password to 32 bytes
const secret = crypto.scryptSync(testPassword, 'goofyAAH', 32);


describe('AES File Steam Encryption', () => {

    //Expect the file to exist and be plaintext.
    test('Create plaintest file for testing', () => {
        // Create a plaintext file
        fs.writeFileSync(plaintextFile, testString, 'utf8');
        expect(fs.readFileSync(plaintextFile, 'utf8')).toBe(testString);
    });

   

    test('Input stream must successfully encrypt, write to file, and not equal original.', async () => {
         // Create read and write streams for encryption
        const inputStream = fs.createReadStream(plaintextFile);
        const outputStream = fs.createWriteStream(encryptedFile);
        // Encrypt the file
        await aesEncryptFileStream(inputStream, outputStream, secret);

        // Expect the file to exist and not be plaintext.
        expect(fs.existsSync(encryptedFile)).toBe(true);
        expect(fs.readFileSync(encryptedFile, 'utf8')).not.toBe(testString);

        //Make sure the file isn't empty
        expect(fs.readFileSync(encryptedFile, 'utf8').length).toBeGreaterThan(0);

        //Close the stream
        outputStream.close();

        //Dispose fs

    });

    test('Decrypted file must equal the original.', async () => {
        const encryptedStream = fs.createReadStream(encryptedFile);
        const decryptedStream = fs.createWriteStream(decryptedFile);
    
        // Decrypt the file
        await aesDecryptFileStream(encryptedStream, decryptedStream, secret);
    
        // Close the write stream and wait for it to finish writing
        decryptedStream.end();
        await new Promise((resolve) => {
            decryptedStream.on('finish', resolve);
        });
    
        // Read the decrypted content
        const decryptedContent = fs.readFileSync(decryptedFile, 'utf8');
    
        // Assert that the decrypted content matches the original plaintext
        expect(decryptedContent).toBe(testString);
    });
    
});



describe('AES Text Encryption Suite', () => {
    let testEncryptedString;
    test('Encryption function should return IV:text in correct format.', async () => {
        const returnedEncryptedValue = await aesEncryptText(testString, testPassword, testIV);
        testEncryptedString = returnedEncryptedValue;
        expect(returnedEncryptedValue).toBe(`${testIV.toString('hex')}:${returnedEncryptedValue.split(':')[1]}`);
    });
    test('Decryption function should return the original text.', async () => {
        const testDecryptedString = await aesDecryptText(testEncryptedString, testPassword);
        expect(testDecryptedString).toBe(testString);
    });

    test('Encryption function should either reject or throw an error if the optional IV is incorrectly formatted', async () => {
        await aesEncryptText(testString, testPassword, '123').catch((err) => {
            expect(err).toBeInstanceOf(Error);
        });
    });


});


afterAll(() => {
    if (fs.existsSync(TMP_DIR)) {
        //FORCE DELETE THE DIRECTORY
        fs.rm(TMP_DIR, { recursive: true, force: true }, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
});