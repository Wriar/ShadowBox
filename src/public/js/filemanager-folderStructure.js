//let folderStructureCache;

function regenerateFolderStructure() {
    //Remove all HTML from the fileTree element.
    document.getElementById("fileTree").innerHTML = "";
    document.getElementById('fileTree-status').style.display = "block";
    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/fm-dash/getFolderStructure");
    xhr.responseType = "json";
    xhr.onload = function () {
        if (xhr.status === 200) {
            let response = xhr.response;
            if (response.code === 0) {
                const data = response.folderStructure;
                //folderStructureCache = data;
                console.log(data);

                if (createFolderStructure(document.getElementById("fileTree"), data)) {
                    document.getElementById('fileTree-status').style.display = "none";
                }


                let toggler = document.getElementsByClassName("caret");
                let i;

                for (i = 0; i < toggler.length; i++) {
                    toggler[i].addEventListener("click", function () {
                        this.parentElement.querySelector(".nested").classList.toggle("active");
                        this.classList.toggle("folder-down");
                    });
                }
            } else {
                throw new Error(response);
            }
        } else {
            console.error("(J) Could not fetch folder structure.");
            console.log(xhr.statusText);
        }
    };

    // Handle errors that may occur during the request
    xhr.onerror = function () {
        console.error("(J) Could not fetch folder structure.");
        console.log(xhr.statusText);
    };

    // Send the request to the server
    xhr.send();

}

let createdHomeIcon = false;
function createFolderStructure(parent, data) {
    const folder = document.createElement("li");

    if (data.children && data.children.length > 0) {
        if (!createdHomeIcon) {
            folder.innerHTML = `<span class="folder caret"><i class="icon-home"></i> ${data.name}</span>`;
            createdHomeIcon = true;
        } else {
            folder.innerHTML = `<span class="folder caret">${data.name}</span>`;
        }

        const ul = document.createElement("ul");
        ul.className = "nested";

        data.children.forEach((child) => {
            if (child.children) {
                createFolderStructure(ul, child);
            } else {
                const item = document.createElement("li");
                item.className = "fileItem folder";
                item.textContent = child.name;
                ul.appendChild(item);
            }
        });

        folder.appendChild(ul);
    } else {
        folder.className = "fileItem folder";
        folder.textContent = data.name;
    }

    parent.appendChild(folder);
    return true;
}

regenerateFolderStructure();


