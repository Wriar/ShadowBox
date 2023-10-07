//Right Click Context Menu, Action Handlers, Etc

const contextMenu = document.getElementById('contextMenu');
document.onclick = function(e) {
    contextMenu.style.display = 'none';
}

document.oncontextmenu = function (e) {
    //Start with the element. Check if it has a data-ctm attribute. If not, check its parent. Repeat until we find one.
    //If the parent has a data-no-ctm attribute, stop.
    let ctmElement = e.target;
    while (!ctmElement.hasAttribute('data-ctm')) {
        ctmElement = ctmElement.parentElement;
        if (ctmElement.hasAttribute('data-no-ctm')) {
            contextMenu.style.display = 'none';
            return;
        }
    }
    if(!ctmElement) {
        //No context menu element was found
        contextMenu.style.display = 'none';
        return;
    }

    //Right click context was found
    e.preventDefault();

    const contextMenuAction = ctmElement.getAttribute('data-ctm');
    //alert(contextMenuAction);

    contextMenu.style.left = e.pageX + 'px'
    contextMenu.style.top = e.pageY + 'px'
    contextMenu.style.display = 'block'


}