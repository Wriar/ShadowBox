import fs from 'fs';
import { aesDecryptFileStream, aesEncryptFileStream } from '../cryptography.js';
import path from 'path';
import { fileURLToPath } from 'url';
import busboy from 'busboy';
const __dirname = path.dirname(fileURLToPath(import.meta.url)); //Allows __dirname to be used


export default function uploadersRoute(app) {
    app.post('/upload', (req, res) => {
        const busboyInstance = busboy({ headers: req.headers });

        // Create a write stream to save the uploaded file
        let fileName;
        let writeStream;


        busboyInstance.on('file', (fieldname, file) => {
            fileName = 'encrypted_file.txt'; // Modify the filename as needed
            const filePath = `${__dirname}/${fileName}`;
            writeStream = fs.createWriteStream(filePath);

            // Perform file encryption asynchronously

            aesEncryptFileStream(file, writeStream, 'TESTESTESTESTESTESTESTESTESTESTE')
                .then(() => {
                    file.resume(); // Consume the remaining stream
                })
                .catch((error) => {
                    console.error('Encryption error:', error);
                    res.status(500).send('Encryption error');
                });

            //file.pipe(writeStream);

        });

        busboyInstance.on('finish', () => {
            res.end('Upload complete');
            console.log('File upload complete');
        });

        req.pipe(busboyInstance);
    });

    // Set up a route for handling file decryption and download
    app.get('/download', async (req, res) => {
        try {
            // Create a read stream from the encrypted file
            const fileName = 'encrypted_file.txt'; // Modify the filename as needed
            const filePath = `${__dirname}/${fileName}`;
            const readStream = fs.createReadStream(filePath);

            // Perform file decryption asynchronously
            //console.log("Using IV: " + iv.toString('hex'));
            console.log("Awaiting AES Decrypt Stream");
            
            res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

            await aesDecryptFileStream(readStream, res, "TESTESTESTESTESTESTESTESTESTESTE");

            //For debugging purposes we will just copy the file.
            //readStream.pipe(res);

            console.log('File download complete');
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Server error');
        }
    });
}