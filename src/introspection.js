import fs from 'fs/promises';
import userDataPool from './server/db/userFileData.js';
import {aesDecryptText} from "./cryptography.js";
import createLog from "./server/logger.js";

const FILE_BIN_BASEPATH = process.env.FILE_BIN_BASEPATH;

//#region Old Functions using direct file-system access naming (not used)
/**
 * Recursively list all folders and all subfolders within a directory.
 * Does not list files.
 * Returns a list of all directory names. ('documents', 'documents/folder1', 'documents/folder2/folder1', 'pictures', etc.)
 * @param {String} dirPath 
 */
async function listDirectoryStructure(dirPath) {
    const result = []
    const dirs = await fs.readdir(dirPath, { withFileTypes: true })
    for (const dir of dirs) {
        if (dir.isDirectory()) {
            const subDirs = await listDirectoryStructure(`${dirPath}/${dir.name}`)
            for (const subDir of subDirs) {
                result.push(`${dir.name}/${subDir}`)
            }
            result.push(dir.name)
        }
    }
    return result
}

/**
 * Converts data from the ``listDirectoryStructure()`` function into a JSON object that can be used by the ``filemanager-folderStructure.js`` file.
 * @param {Array} folderList An array of folders in the format of ``['documents', 'documents/folder1', 'documents/folder2/folder1', 'pictures'] etc``
 * @returns {Object} A JSON representation of the folder structure.
 */
function convertFolderListToJSON(folderList) {
    // Initialize the root node with the name "My Files" and an empty children array.
    const root = { name: "My Files", children: [] };

    // Iterate through each folder path in the provided folder list.
    folderList.forEach((folderPath) => {
        // Split the folder path into individual folder names using '/' as the delimiter.
        const folders = folderPath.split('/');
        let currentNode = root; // Start from the root node.

        // Iterate through each folder name in the path.
        folders.forEach((folderName) => {
            // Check if a child node with the same name already exists.
            let folderNode = currentNode.children.find((child) => child.name === folderName);

            // If the child node doesn't exist, create it and add it to the current node's children.
            if (!folderNode) {
                folderNode = { name: folderName, children: [] };
                currentNode.children.push(folderNode);
            }

            // Update the current node to the newly created or existing child node.
            currentNode = folderNode;
        });
    });

    // Return the root node, which now represents the entire folder structure in JSON format.
    return root;
}

//#endregion

/**
 * Provided a username, asynchronously returns the decrypted folder structure of the user.
 * Assumes that any requests are authenticated and verified prior to calling this function.
 * @param {String} username Username of the user to get the directory structure of. 
 * @returns {Boolean, Array, Array} Returns an array containing the success status of the operation, and the folder structure of the user.
 */
async function getDecryptedUserDirectoryStructure(username, clearAccountMaster) {

    /*
    old code:

    const dirPath = `${FILE_BIN_BASEPATH}/${username}`;
    const folderList = await listDirectoryStructure(dirPath);
    const folderStructure = convertFolderListToJSON(folderList);
    return folderStructure;
    */

    const retrievalResult = await returnUserVirtualDirectories(username);
    if (!retrievalResult[0]) {
        console.error("Error retrieving virtual directories for user " + username);
        return [false, null];
    }
    const rows = retrievalResult[1];

    let finalFolderStructure = [];
    let finalFolderList = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const dirID = row.dirID;
        const dirFullPath = (await aesDecryptText(row.dirFullPath, clearAccountMaster)).substring(1);
        const createdAt = await aesDecryptText(row.createdAt, clearAccountMaster);
        const meta = row.meta; //TODO

        finalFolderList[i] = dirFullPath;
        finalFolderStructure[i] = [dirID, dirFullPath, createdAt, meta];
    }


    return [true, convertFolderListToJSON(finalFolderList), finalFolderStructure];
}

/**
 * Given a username, asynchronously returns the user's encrypted virtual directories on the Database Server.
 * **WARNING:** assumes username is sanitized and trusted; an additional check will be conducted.
 * @param {String} username Username of the user to get the virtual directories of.
 * @returns {Promise<boolean[]|(boolean|*)[]>}
 */
async function returnUserVirtualDirectories(username) {
    let conn;
    if (!verifyUntrustedSQLInput(username)) {
        console.error("Unsanitized username provided to virtual directory lookup. Aborting...");
        return [false, null];
    }
    try {
        conn = await userDataPool.getConnection();
        const rows = await conn.query(`SELECT * FROM ${username}_virtualdir;`);
        return [true, rows];
    } catch (err) {
        return [false, null];
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

async function returnUserFileListing(username, dirUUID, clearAccountMaster) {
    let conn;
    if (!verifyUntrustedSQLInput(username)) {
        console.error("Un-sanitized username provided to file listing lookup. Aborting...");
        return [false, "Sanitization Error"];
    }
    try {
        conn = await userDataPool.getConnection();
        //DirUUID should be prepared
        const rows = await conn.query(`SELECT * FROM ${username} WHERE filePath = ?;`, [dirUUID]);
        let returnResults = [];
        for (let i = 0; i < rows.length; i++) {
            //Decrypt the file name and file path
            const row = rows[i];
            const objectID = row.objectID;
            const fileName = await aesDecryptText(row.fileName, clearAccountMaster); //There is no redundant await, analyzer is incorrect.
            const modifiedDate = await aesDecryptText(row.modifiedDate, clearAccountMaster);
            const meta = row.meta; //TODO
            const permissions = row.permissions; //TODO

            returnResults[i] = [objectID, fileName, dirUUID, modifiedDate, meta, permissions];

        }
        return [true, returnResults];
    } catch (err) {
        createLog(2, `Error retrieving file listing for user ${username} in directory ${dirUUID}.`, err);
        return [false, null];
    } finally {
        if (conn) {
            await conn.release();
        }
    }
}

/**
 * Verifies that the provided input is safe for use in SQL queries, exclusively for username lookups.
 * Checks if the input contains only letters, numbers, underscores, and/or dashes.
 * @param input {String} The input to verify.
 * @returns {boolean} Whether or not the input is safe for use in SQL queries.
 */
function verifyUntrustedSQLInput(input) {
    //Ensure the input contains only letters, numbers, underscores, and dashes.
    const regex = /^[a-zA-Z0-9_-]*$/;
    return regex.test(input);
}


export {
    listDirectoryStructure,
    convertFolderListToJSON,
    getDecryptedUserDirectoryStructure,
    returnUserFileListing,
    returnUserVirtualDirectories
} //