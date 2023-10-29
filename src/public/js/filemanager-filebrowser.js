/*
File Generation Method:
 */

const fileExtensionsMap = new Map([
    ['.docx', 'Document (DOCX)'],
    ['.pdf', 'Document (PDF)'],
    ['.pptx', 'Presentation (PPTX)'],
    ['.xlsx', 'Spreadsheet (XLSX)'],
    ['.jpg', 'Image (JPG)'],
    ['.jpeg', 'Image (JPEG)'],
    ['.png', 'Image (PNG)'],
    ['.gif', 'Image (GIF)'],
    ['.bmp', 'Image (BMP)'],
    ['.tiff', 'Image (TIFF)'],
    ['.txt', 'Text (TXT)'],
    ['.html', 'Web Page (HTML)'],
    ['.css', 'Stylesheet (CSS)'],
    ['.js', 'JavaScript (JS)'],
    ['.json', 'JSON (JSON)'],
    ['.xml', 'XML (XML)'],
    ['.csv', 'Comma-Separated Values (CSV)'],
    ['.zip', 'Compressed (ZIP)'],
    ['.rar', 'Compressed (RAR)'],
    ['.7z', 'Compressed (7Z)'],
    ['.tar', 'Compressed (TAR)'],
    ['.exe', 'Executable Binary (EXE)'],
    ['.dll', 'Dynamic Link Library (DLL)'],
    ['.app', 'Application (APP)'],
    ['.iso', 'Disk Image (ISO)'],
    ['.mp3', 'Audio (MP3)'],
    ['.wav', 'Audio (WAV)'],
    ['.mp4', 'Video (MP4)'],
    ['.avi', 'Video (AVI)'],
    ['.mov', 'Video (MOV)'],
    ['.wmv', 'Video (WMV)'],
    ['.mpg', 'Video (MPG)'],
    ['.flv', 'Video (FLV)'],
    ['.m4a', 'Audio (M4A)'],
    ['.ogg', 'Audio (OGG)'],
    ['.aac', 'Audio (AAC)'],
    ['.zipx', 'Compressed (ZIPX)'],
    ['.psd', 'Image (PSD)'],
    ['.ai', 'Vector Image (AI)'],
    ['.eps', 'Vector Image (EPS)'],
    ['.svg', 'Vector Image (SVG)'],
    ['.mpg', 'Video (MPG)'],
    ['.mov', 'Video (MOV)'],
    ['.mpg', 'Video (MPG)'],
    ['.md', 'Markdown (MD)'],
    ['.cpp', 'C++ Source Code (CPP)'],
    ['.java', 'Java Source Code (JAVA)'],
    ['.py', 'Python Source Code (PY)'],
    ['.php', 'PHP Source Code (PHP)'],
    ['.html', 'Web Page (HTML)'],
    ['.xls', 'Spreadsheet (XLS)'],
    ['.ppt', 'Presentation (PPT)'],
    ['.log', 'Log File (LOG)'],
]);


let CURRENT_DIRECTORY_ID = "";

const fileTableElementSkeleton = `                            
<tr id="object_$uuid">
    <td><input id="check_$uuid" type="checkbox"></td>
    <td><img id="icon_$uuid" src="/static-resx/ico/files/$icon" alt="icon" /> $name</td>
    <td>$size</td>
    <td>$type</td>
    <td>$date</td>
    <td>$attributes</td>
</tr>
`;

//To get the total contents (files+folders) in a directory, combine both getFileFolderListing() and getCurrentDirectoryFolders().
async function getFileFolderListing(dirID) {
    const csrfToken = document.getElementById("csrf_token").value;
    const endpoint = `/api/fm-dash/getFileListing?dirID=${dirID}&csrf_token=${csrfToken}`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint, true);
    xhr.responseType = "json";
    xhr.send();

    return new Promise((resolve, reject) => {
        xhr.onload = function () {
            if (xhr.status === 200) {
                let response = xhr.response;
                if (response.code === 0) {
                    resolve(response.fileListing);
                } else {
                    reject(response.message);
                }
            } else {
                reject(xhr.status);
            }
        };
    });
}

function getCurrentDirectoryFolders(dirID) {
    //If directoryID is null, we are requesting the root directory. Return all array items in CLEAR_FOLDER_STRUCTURE_CACHE where each item's position 1 contains no slash.

    if(CLEAR_FOLDER_STRUCTURE_CACHE === null) {
        console.error("Folder structure has not introspected yet!");
        generateToast(2, "Please wait until the folder structure has been loaded & try again.");
        return false;
    }

    if (dirID === "" || dirID === undefined) {
        // eslint-disable-next-line no-undef
        let returnFolders = [];
        for (let i = 0; i < CLEAR_FOLDER_STRUCTURE_CACHE.length; i++) {
            const folder = CLEAR_FOLDER_STRUCTURE_CACHE[i];
            if (folder[1].indexOf("/") === -1) {
                const folderFullPath = folder[1];
                returnFolders.push([folder[0], folderFullPath, folderFullPath, folder[2], folder[3]]);
            }
        }
        return returnFolders;
    }

    //Get the folder path from the directoryID
    let directoryPath = null;

    for(let i = 0; i < CLEAR_FOLDER_STRUCTURE_CACHE.length; i++) {
        const folder = CLEAR_FOLDER_STRUCTURE_CACHE[i];
        if(folder[0] === dirID) {
            directoryPath = folder[1]; // --> "personal/documents/2021"
        }
    }

    if(directoryPath === null) {
        generateToast(2, "That directory does not exist. Please try again.");
        console.error("Directory ID " + dirID + " not found in folder structure.");
        return false;
    }

    //Search for all folders that start with the directory path.
    //For example, if directory ID maps to "personal", return all folders that are like "personal/test" or "personal/balls"
    // but do NOT return "personal" itself or "personal/test/1" or "personal/balls/2/test1"

    let returnFolders = [];
    let totalSlashes = directoryPath.split("/").length - 1;

    for(let i = 0; i < CLEAR_FOLDER_STRUCTURE_CACHE.length; i++) {
        const folder = CLEAR_FOLDER_STRUCTURE_CACHE[i];

        const folderTotalSlashes = folder[1].split("/").length - 1;
        const expectedFolderSlashes = totalSlashes + 1;
        if(folder[1].startsWith(directoryPath + "/") && folder[1] !== directoryPath && folderTotalSlashes === expectedFolderSlashes) {
            const folderFullPath = folder[1];
            const folderName = folderFullPath.substring(folderFullPath.lastIndexOf("/") + 1);
            returnFolders.push([folder[0], folderName, folderFullPath, folder[2], folder[3]]);
        }
    }
    return returnFolders;
}

/**
 * Given an ISO date string, return it in a beautified format. (MM/DD/YYYY HH:MM AM/PM)
 * @param isoDateString
 * @returns {*|string}
 */
function returnBeautifiedDate(isoDateString) {
    //Given a date in format "2020-06-20T20:44:03.168Z", return it in format "09/30/2023 4:15 PM" in the user's timezone.
    try {
        const date = new Date(isoDateString);

        //Ensure that 0 is appended if the date is less than 10.
        let month = date.getMonth() + 1;
        if(month < 10) {
            month = "0" + month;
        }
        let day = date.getDate();
        if(day < 10) {
            day = "0" + day;
        }

        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = "AM";
        if(hours > 12) {
            hours -= 12;
            ampm = "PM";
        }
        if(hours < 10) {
            hours = "0" + hours;
        }
        if(minutes < 10) {
            minutes = "0" + minutes;
        }

        return `${month}/${day}/${date.getFullYear()} ${hours}:${minutes} ${ampm}`;

    } catch(e) {
        console.error("Error cleaning date " + isoDateString);
        return isoDateString;
    }

}



async function populateFileBrowser(dirID) {
    let fileListing = await getFileFolderListing(dirID);
    let folderListing = getCurrentDirectoryFolders(dirID);

    if(!fileListing || !folderListing) {
        generateToast(3, "Error retrieving document listing.");
        console.log(`File Listing was ${fileListing} and Folder Listing was ${folderListing}.`);
        console.error("Error retrieving document listing.");
        return false;
    }


    fileListing = fileListing[1];


    let tableHTML = "";

    //Generate folder listing HTML
    for(let i = 0; i < folderListing.length; i++) {
        let generatedHTML = fileTableElementSkeleton;
        generatedHTML = generatedHTML.replaceAll("$uuid", folderListing[i][0]);
        generatedHTML = generatedHTML.replaceAll("$icon", "folder.png");
        generatedHTML = generatedHTML.replaceAll("$name", folderListing[i][1]);
        generatedHTML = generatedHTML.replaceAll("$size", "");
        generatedHTML = generatedHTML.replaceAll("$type", "File Folder");
        generatedHTML = generatedHTML.replaceAll("$date", returnBeautifiedDate(folderListing[i][3]));
        generatedHTML = generatedHTML.replaceAll("$attributes", folderListing[i][4]);
        tableHTML += generatedHTML;
    }

    //Generate file listing HTML
    for(let i = 0; i < fileListing.length; i++) {
        let generatedHTML = fileTableElementSkeleton;
        const fileExtension = fileListing[i][1].substring(fileListing[i][1].lastIndexOf("."));
        let fileType = fileExtensionsMap.get(fileExtension.toLowerCase()) ?? `${fileExtension.substring(1).toUpperCase()} File`;
        generatedHTML = generatedHTML.replaceAll("$uuid", fileListing[i][0]);
        generatedHTML = generatedHTML.replaceAll("$icon", "document.png");
        generatedHTML = generatedHTML.replaceAll("$name", fileListing[i][1]);
        generatedHTML = generatedHTML.replaceAll("$size", fileListing[i][2]);
        generatedHTML = generatedHTML.replaceAll("$type", fileType);
        generatedHTML = generatedHTML.replaceAll("$date", returnBeautifiedDate(fileListing[i][3]));
        generatedHTML = generatedHTML.replaceAll("$attributes", fileListing[i][4]);
        tableHTML += generatedHTML;
    }

    document.getElementById('file-browser-body').innerHTML = tableHTML;

    //console.log(tableHTML);

}