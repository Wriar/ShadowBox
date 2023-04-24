const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const app = express();

const upload = multer();

app.post('/upload', upload.single('file'), (req, res, next) => {
    // Read the uploaded file data from the buffer


    const fileBuffer = req.file.buffer;
    const fileSHA512Hash = crypto.createHash('sha512').update(fileBuffer).digest('hex');

    const randomSalt = generateRandomSalt();


    //Contains the file name and the hash of the file name and the salt (salt;hash)
    //When encrypted, is in the form of (salt;hash)
    //To verify the file name, the file name is hashed with the salt and compared to the hash. Sample: (salt;hash) = (salt;hash)
    const fileNameSHA512HashSalt = randomSalt + ";" + crypto.createHash('sha512').update(randomSalt + ";" + req.file.originalname).digest('hex');
    
    //Contains the file name encrypted with a password using AES256
    const fileNameAESEncrypted = encryptStringWithPassword(req.file.originalname, 'u7x!A%D*G-KaPdSgVkXp2s5v8y/B?E(H');

    console.log("The file name will be: " + fileNameSHA512HashSalt + "|" + fileNameAESEncrypted);

    console.log('File SHA512 CONTENTS Hash:', fileSHA512Hash);
    console.log('File NAME SHA512 Salt;Hash:', fileNameSHA512HashSalt);
    console.log('File Name AES Encrypted With password:', fileNameAESEncrypted);
    console.log('File Name AES Decrypted Verify W/ Password: ' + decryptStringWithPassword(fileNameAESEncrypted, 'u7x!A%D*G-KaPdSgVkXp2s5v8y/B?E(H'));

    // Generate a random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);

    // Create a cipher using AES256 algorithm with a secret key and IV
    const cipher = crypto.createCipheriv('aes-256-cbc', 'u7x!A%D*G-KaPdSgVkXp2s5v8y/B?E(H', iv);

    // Encrypt the file data
    const encryptedBuffer = Buffer.concat([iv, cipher.update(fileBuffer), cipher.final()]);

    // Write the encrypted file to the 'uploads' folder with a modified file name
    //const encryptedFileName = `encrypted_${req.file.originalname}`;
    const encryptedFileName = fileNameSHA512HashSalt + "|" + fileNameAESEncrypted;


    fs.writeFileSync(`uploads/${encryptedFileName}`, encryptedBuffer);

    // Send a response indicating successful file upload
    res.send(`File uploaded and encrypted successfully. Encrypted file saved as ${encryptedFileName}`);
});

app.post('/uploadDebug', upload.single('file'), (req, res, next) => {
    const fileBuffer = req.file.buffer;
    const fileSHA512Hash = crypto.createHash('sha512').update(fileBuffer).digest('hex');

    const randomSalt = generateRandomSalt();


    //Contains the file name and the hash of the file name and the salt (salt;hash)
    //When encrypted, is in the form of (salt;hash)
    //To verify the file name, the file name is hashed with the salt and compared to the hash. Sample: (salt;hash) = (salt;hash)
    const fileNameSHA512HashSalt = randomSalt + ";" + crypto.createHash('sha512').update(randomSalt + ";" + req.file.originalname).digest('hex');
    
    //Contains the file name encrypted with a password using AES256
    const fileNameAESEncrypted = encryptStringWithPassword(req.file.originalname, 'u7x!A%D*G-KaPdSgVkXp2s5v8y/B?E(H');

    

    // Generate a random IV (Initialization Vector)
    const iv = crypto.randomBytes(16);

    // Create a cipher using AES256 algorithm with a secret key and IV
    const cipher = crypto.createCipheriv('aes-256-cbc', 'u7x!A%D*G-KaPdSgVkXp2s5v8y/B?E(H', iv);

    // Encrypt the file data
    const encryptedBuffer = Buffer.concat([iv, cipher.update(fileBuffer), cipher.final()]);

    // Write the encrypted file to the 'uploads' folder with a modified file name
    //const encryptedFileName = `encrypted_${req.file.originalname}`;

    console.log('File SHA512 CONTENTS Hash:', fileSHA512Hash);
    console.log('File NAME SHA512 Salt;Hash:', fileNameSHA512HashSalt);
    console.log('File Name AES Encrypted With password:', fileNameAESEncrypted);
    console.log('File Name AES Decrypted Verify W/ Password: ' + decryptStringWithPassword(fileNameAESEncrypted, 'u7x!A%D*G-KaPdSgVkXp2s5v8y/B?E(H'));
    console.log('Length of File Data CBC Buffer: ' + fileBuffer.length);


    const encryptedFileName = `encrypted_${req.file.originalname}`;
    const fileNameDecryptCheck = decryptStringWithPassword(fileNameAESEncrypted, 'u7x!A%D*G-KaPdSgVkXp2s5v8y/B?E(H');

    fs.writeFileSync(`uploads/${encryptedFileName}`, encryptedBuffer);

    // Send a JSON response indicating successful file upload, including the 5 console logs
    res.json({
        'File SHA512 CONTENTS Hash': fileSHA512Hash,
        'File NAME SHA512 Salt;Hash': fileNameSHA512HashSalt,
        'File Name AES Encrypted With password': fileNameAESEncrypted,
        'File Name AES Decrypted Verify W/ Password (CHECK ONLY)': fileNameDecryptCheck,
        'Length of File Data Buffer': fileBuffer.length
    });

});

app.get('/uploader', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.get('/decrypt/:fileName', (req, res, next) => {
    // Extract the file name from the URL parameters
    const fileName = req.params.fileName;

    // Read the encrypted file from the file system
    const encryptedBuffer = fs.readFileSync(`./uploads/${fileName}`);

    // Extract the IV and encrypted data from the encrypted buffer
    const iv = encryptedBuffer.slice(0, 16);
    const encryptedData = encryptedBuffer.slice(16);

    // Create a decipher using AES256 algorithm with the secret key and IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', 'u7x!A%D*G-KaPdSgVkXp2s5v8y/B?E(H', iv);

    // Decrypt the encrypted data
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    // Set the appropriate response headers for the decrypted file
    res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName.replace('encrypted_', 'decrypted_')}"`,
        'Content-Length': decryptedBuffer.length
    });

    // Send the decrypted file as a response
    res.send(decryptedBuffer);
});

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
  
  // Function to decrypt a string with a password
  function decryptStringWithPassword(encryptedString, password) {
    // Extract the IV and the encrypted data from the input string
    const iv = Buffer.from(encryptedString.slice(0, 32), 'hex');
    const encryptedData = Buffer.from(encryptedString.slice(32), 'base64');
  
    // Create a Decipher using AES-256-CBC algorithm with the password and IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', password, iv);
  
    // Decrypt the encrypted data
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  
    // Return the decrypted string
    return decryptedBuffer.toString('utf-8');
  }


  function generateRandomSalt(length = 16) {
    return crypto.randomBytes(length).toString('hex');
  }


app.listen(3001, () => console.log('Server running on port 3001'));