//Right Click Context Menu, Action Handlers, Etc

document.oncontextmenu = function (e) {
    //Start with the element. Check if it has a data-ctm attribute. If not, check its parent. Repeat until we find one.
    //If the parent has a data-no-ctm attribute, stop.
    let ctmElement = e.target;
    while (!ctmElement.hasAttribute('data-ctm')) {
        ctmElement = ctmElement.parentElement;
        if (ctmElement.hasAttribute('data-no-ctm')) {
            return;
        }
    }
    if(!ctmElement) {
        return;
    }

    //Right click context was found
    e.preventDefault();

    const contextMenuAction = ctmElement.getAttribute('data-ctm');
    alert(contextMenuAction);


}