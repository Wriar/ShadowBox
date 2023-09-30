/* eslint-disable no-unused-vars */
function toggleSideBar() {
    document.getElementById("propViewer").style.width = "250px";
    document.getElementById("filemanager-container").style.marginRight = "250px"; /* Change margin-left to margin-right */
    document.getElementById("filemanager-wrapper").classList.add("filemanager-wrapper");
}

function closeNav() {
    document.getElementById("propViewer").style.width = "0";
    document.getElementById("filemanager-wrapper").classList.add("filemanager-wrapper-closed");
    document.getElementById("filemanager-wrapper").classList.remove("filemanager-wrapper");

    //Wait 0.5 seconds, then remove the filemanager-wrapper-closed class. This allows the animation to play next time the DIV is opened.
    setTimeout(function () {
        document.getElementById("filemanager-wrapper").classList.remove("filemanager-wrapper-closed");
    }, 500);
}

//Defines possible states the sidebar can be in.
const interfaceStatus = {
    LOADING_GENERIC: 1,
    READY: 0,
}

/**
 * Modifies the sidebar interface based on the provided status.
 * @param statusEnum {interfaceStatus} The status to set the sidebar to.
 * @param statusMessage {string=} The status message to display to the user if the selected enum permits (optional)
 */
function modifySidebarInterfaceStatus(statusEnum, statusMessage) {
    switch(statusEnum) {
        case interfaceStatus.LOADING_GENERIC:
            document.getElementById("sidebar-interfaces_description").innerText = statusMessage;
            document.getElementById("sidebar-interfaces_loader").style.display = "inline-block";
            document.getElementById("sidebar-interfaces_loader").style.opacity = "100"; //use for now TODO later

            break;
        case interfaceStatus.READY:
            document.getElementById("sidebar-interfaces_description").innerHTML = `<i style="color: var(--success);" class="icon-file-check-2"></i> ${statusMessage}`;
            document.getElementById("sidebar-interfaces_loader").style.opacity = "0"; //use for now TODO later
            break;
        default:
            console.error(`Unknown interface status enum ${statusEnum}`);
    }
}