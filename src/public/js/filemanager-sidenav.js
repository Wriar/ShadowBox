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