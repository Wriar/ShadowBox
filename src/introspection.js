import fs from 'fs/promises'

const FILE_BIN_BASEPATH = process.env.FILE_BIN_BASEPATH;
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

/**
 * Provided a username, asynchronously returns the folder structure of the user.
 * @param {String} username Username of the user to get the directory structure of. 
 * @returns {Object} A JSON representation of the folder structure. { name: "My Files", children: [] }
 */
async function getUserDirectoryStructure(username) {
    //TODO: Support multiple user storage solutions.
    const arrayFolderStructure = await listDirectoryStructure(`${FILE_BIN_BASEPATH}/${username}`);
    return convertFolderListToJSON(arrayFolderStructure);
}



export { listDirectoryStructure, convertFolderListToJSON, getUserDirectoryStructure }