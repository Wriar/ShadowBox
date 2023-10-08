/* eslint-disable no-undef */
//let folderStructureCache;
const DO_EXPAND_ROOT_STRUCTURE = true;
const csrfToken = document.getElementById("csrf_token").value;
let totalIntrospectionItems = 0;
function regenerateFolderStructure() {
    //Remove all HTML from the fileTree element.
    document.getElementById("fileTree").innerHTML = "";
    document.getElementById('fileTree-status').style.display = "block";
    modifySidebarInterfaceStatus(interfaceStatus.LOADING_GENERIC, "Loading folder structure...");
    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();
    const url = `/api/fm-dash/getFolderStructure?csrf_token=${csrfToken}`;
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function () {
        if (xhr.status === 200) {
            let response = xhr.response;
            if (response.code === 0) {

                const folderData = response.folderStructure[1];
                console.log(folderData);

                //TODO: Implement Web Worker for queries over 1000 folders.

                if(folderData.length >= 1000) {
                    const promptResult = confirm(`Warning: You have ${folderData.length} folders which exceeds the recommended limit of 1000 folders. 
                    This may cause the browser to become unresponsive during decryption & introspection. Are you sure you want to continue?`);

                    if (!promptResult) {
                        modifySidebarInterfaceStatus(interfaceStatus.READY, "Unloaded.");
                        generateToast(3, "Folder structure loading cancelled.");
                        return;
                    }
                }

                //TODO: Decrypt Requests; appropriately parse the data.



                const folderStructureResult = createFolderStructure(document.getElementById("fileTree"), data);

                if (folderStructureResult[0], data) {
                    document.getElementById('fileTree-status').style.display = "none";
                    modifySidebarInterfaceStatus(interfaceStatus.READY, "Up to date.");
                }

                let toggler = document.getElementsByClassName("caret");
                let i;

                for (i = 0; i < toggler.length; i++) {
                    toggler[i].addEventListener("click", function () {
                        this.parentElement.querySelector(".nested").classList.toggle("active");
                        this.classList.toggle("folder-down");
                    });
                }

                if(folderStructureResult[0]) {
                    // eslint-disable-next-line no-undef
                    generateToast(0, `Successfully introspected ${totalIntrospectionItems} item${(totalIntrospectionItems > 1 ? "s" : "")}`);
                }
                totalIntrospectionItems = 0; //Clear the total introspection items counter.
            } else {
                generateToast(3, response.message);
                console.warn(`Fetch Error ${url}: ${response.message}`);
            }
        } else {
            console.error("(J-SERVER) Could not fetch folder structure.");
            generateToast(3, "Could not fetch the folder structure.");
            console.log(xhr.statusText);
        }
    };

    // Handle errors that may occur during the request
    xhr.onerror = function () {
        console.error("(J) Could not fetch folder structure.");
        generateToast(3, "Could not fetch the folder structure.");
        console.log(xhr.statusText);
    };

    // Send the request to the server
    xhr.send();

}

let createdHomeIcon = false;

//Used to initially expand the root folder if DO_EXPAND_ROOT_STRUCTURE is true.
let expandedInitialNestElement = false;

function createFolderStructure(parent, data) {
    let totalItems = 0;
    const folder = document.createElement("li");

    if (data.children && data.children.length > 0) {
        if (!createdHomeIcon && DO_EXPAND_ROOT_STRUCTURE) {
            folder.innerHTML = `<span class="folder caret folder-down"><i class="icon-home"></i> ${data.name}</span>`;
            createdHomeIcon = true;
        } else if (!createdHomeIcon && !DO_EXPAND_ROOT_STRUCTURE) {
            folder.innerHTML = `<span class="folder caret"><i class="icon-home"></i> ${data.name}</span>`;
            createdHomeIcon = true;
        } else {
            folder.innerHTML = `<span class="folder caret">${data.name}</span>`;
        }

        const ul = document.createElement("ul");
        ul.className = "nested";
        if (!expandedInitialNestElement && DO_EXPAND_ROOT_STRUCTURE) {
            ul.className += " active";
            expandedInitialNestElement = true;
        }

        data.children.forEach((child) => {
            if (child.children) {
                createFolderStructure(ul, child);
            } else {
                const item = document.createElement("li");
                item.className = "fileItem folder";

                item.textContent = child.name;
                ul.appendChild(item);
            }
            totalItems++;
            totalIntrospectionItems++;
        });

        folder.appendChild(ul);
    } else {
        folder.className = "fileItem folder";
        folder.textContent = data.name;
    }

    parent.appendChild(folder);
    return [true, totalItems];
}

regenerateFolderStructure();


