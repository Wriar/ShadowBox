/* eslint-disable no-undef */
import { aesEncryptText, aesDecryptText, aesEncryptFileStream, aesDecryptFileStream } from '../src/cryptography.js';  //using the ES6 modules 
import crypto from 'crypto';
import fs from 'fs';

const testString = 'This is a test string';
const testPassword = 'Lilith';
const testIV = crypto.randomBytes(16);

const TMP_DIR = './tests/tmp';

beforeAll(() => {
    if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR);
    }
});

afterAll(() => {
    if (fs.existsSync(TMP_DIR)) {
        //FORCE DELETE THE DIRECTORY
        fs.rmdirSync(TMP_DIR, { recursive: true, force: true });

    }
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
});


describe('AES File Steam Encryption', () => {
    it('should encrypt a file stream and decrypt it successfully', async () => {
        const plaintextFile = `${TMP_DIR}/plaintext.txt`;
        const encryptedFile = `${TMP_DIR}/encrypted.enc`;
        const decryptedFile = `${TMP_DIR}/decrypted.txt`;

        // Create a random secret key for encryption
        const secret = crypto.randomBytes(32);

        // Create a plaintext file
        fs.writeFileSync(plaintextFile, 'Hello, World!', 'utf8');

        // Create read and write streams for encryption
        const inputStream = fs.createReadStream(plaintextFile);
        const outputStream = fs.createWriteStream(encryptedFile);

        // Encrypt the file
        await aesEncryptFileStream(inputStream, outputStream, secret);

        // Create read and write streams for decryption
        const encryptedStream = fs.createReadStream(encryptedFile);
        const decryptedStream = fs.createWriteStream(decryptedFile);

        // Decrypt the file
        await aesDecryptFileStream(encryptedStream, decryptedStream, secret);

        // Read the decrypted content
        const decryptedContent = fs.readFileSync(decryptedFile, 'utf8');

        // Assert that the decrypted content matches the original plaintext
        expect(decryptedContent).toBe('Hello, World!');
    });
});