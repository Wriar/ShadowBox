//import crypto from "crypto";
const AES_KEY_SIZE = 32; //AES-256-CBC Key Size in Bytes.
const AES_ALGORITHM = 'aes-256-cbc'; //AES-256-CBC Algorithm using 16-byte IV.

const crypto = self.crypto;
const buffer = self.buffer;

//The main entry point
onmessage = function (e) {
    const action = e.data.type;
    console.log("Cryptography Worker Received Action: " + action);

    //alert("yay!");

    //Determine what the Cryptography worker needs to do.
    switch(action) {
        case "decryptDirStringBatch": {
            //Contains the folder data
            const data = e.data.data;
            doDirectoryDecryption(data, "thank you so much!!!!!!!!!!!!!!").then((decryptedData) => {
                postMessage({
                    type: "decryptDirStringBatch",
                    data: decryptedData,
                });
            });
        }
    }
}

//Decrypt the raw directory listing, return progress occasionally.
async function doDirectoryDecryption(data, password) {
    let decryptedData = [];
    const totalItems = data.length;

    for(let i = 0; i < totalItems; i++) {
        const dirID = data[i].dirID;
        const dirFullPathEncrypted = data[i].dirFullPath;
        const dirCreatedAtEncrypted = data[i].createdAt;

        const dirFullPathDecrypted = await workerAESDecrypt(dirFullPathEncrypted, password);
        const dirCreatedAtDecrypted = await workerAESDecrypt(dirCreatedAtEncrypted, password);

        decryptedData.push({
            dirID: dirID,
            dirFullPath: dirFullPathDecrypted,
            createdAt: dirCreatedAtDecrypted,
            meta: null,
        });

        let percentageCompleteRounded = `${Math.round((i / totalItems) * 100)}%`;
        postMessage({
            type: "decryptDirStringBatch",
            complete: false,
            data: percentageCompleteRounded,
        });
    }

    return decryptedData;
}


async function workerAESDecrypt(encryptedText, password) {
    return new Promise((resolve, reject) => {
        const [ivHex, encryptedData] = encryptedText.split(':');
        const iv = buffer.Buffer.from(ivHex, 'hex');

        self.crypto.scrypt(password, 'salt', AES_KEY_SIZE, (err, key) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, iv);
                let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
                decryptedData += decipher.final('utf-8');
                resolve(decryptedData);
            } catch (decryptError) {
                reject(new Error('Incorrect password or corrupted data.'));

            }
        });
    });
}









