import fs from 'fs/promises'

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

export { listDirectoryStructure }