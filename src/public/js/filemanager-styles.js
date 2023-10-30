let v_left_element = document.getElementsByClassName("v-left")[0];
let v_right_element = document.getElementsByClassName("v-right")[0];
let body = document.getElementsByTagName("body")[0];
let vwLastPreserveWidth = window.innerWidth;


//If the window width is less than 200px, hide the left element (tree view) and make the right element full width.
//If the window width goes back to the original width, reset the inline styles.

const window_element_resize_observer = new ResizeObserver(function (entries) {
    // eslint-disable-next-line no-unused-vars
    for (const targetResizeObservers of entries) {
        //console.log("The width of left item: " + v_left_element.offsetWidth + "px")
        if (v_left_element.offsetWidth <= 200) {
            if (vwLastPreserveWidth === -1) {
                vwLastPreserveWidth = window.innerWidth;
            }
            v_left_element.classList.add("hidden");
            v_right_element.classList.add("fullwidth");
            document.getElementById('fileTree').style.display = "none";

            //Recursively Loop through all child elements in id=fileTreeView and set their display to none.

            for (let i = 0; i < document.getElementById('fileTreeView').childElementCount; i++) {
                let child = document.getElementById('fileTreeView').children[i];

                child.style.display = "none";
                if (child.children.length > 0) {
                    for (let j = 0; j < child.children.length; j++) {
                        let grandchild = child.children[j];
                        grandchild.style.display = "none";
                        if (grandchild.children.length > 0) {
                            for (let k = 0; k < grandchild.children.length; k++) {
                                let greatgrandchild = grandchild.children[k];
                                greatgrandchild.style.display = "none";
                            }
                        }
                    }
                }
            }
        }

        if (window.innerWidth > vwLastPreserveWidth) {
            vwLastPreserveWidth = -1;
            //Reset the inline styles.
            v_left_element.classList.remove("hidden");
            v_right_element.classList.remove("fullwidth");
            document.getElementById('fileTree').style.display = "block";

            //Recursively Loop through all child elements in id=fileTreeView and set their display to block.

            for (let i = 0; i < document.getElementById('fileTreeView').childElementCount; i++) {
                let child = document.getElementById('fileTreeView').children[i];


                //If the child has a attribute of "data-pos-origin", set its display to that value. Otherwise, set it to block.
                if(child.hasAttribute("data-pos-origin")) {
                    child.style.display = child.getAttribute("data-pos-origin");
                } else {
                    child.style.display = "block";
                }


                if (child.children.length > 0) {
                    for (let j = 0; j < child.children.length; j++) {
                        let grandchild = child.children[j];

                        //If the grandchild has a attribute of "data-pos-origin", set its display to that value. Otherwise, set it to block.
                        if(grandchild.hasAttribute("data-pos-origin")) {
                            grandchild.style.display = grandchild.getAttribute("data-pos-origin");
                        } else {
                            grandchild.style.display = "block";
                        }
                        if (grandchild.children.length > 0) {
                            for (let k = 0; k < grandchild.children.length; k++) {
                                let greatgrandchild = grandchild.children[k];

                                //If the greatgrandchild has a attribute of "data-pos-origin", set its display to that value. Otherwise, set it to block.
                                if(greatgrandchild.hasAttribute("data-pos-origin")) {
                                    greatgrandchild.style.display = greatgrandchild.getAttribute("data-pos-origin");
                                } else {
                                    greatgrandchild.style.display = "block";
                                }
                            }
                        }
                    }
                }
            }
            //Above method will show the introspection loader. Make sure to hide it.
            document.getElementById('fileTree-status').style.display = "none";
        }
    }
});

window_element_resize_observer.observe(body);

/**
 * As the file table height is difficult to set to completely fill the remainder of the page
 * with pure css, this function will set the height of the file table to the height of the viewport.
 *
 * If the number of <tr> items * the height of each <tr> item is greater than the height of the viewport,
 * we will use the dynamic resizing height of the file table. This prevents the file tables from overflowing and causing
 * vertical viewport scroll.
 *
 * Otherwise, the file table is left to the default 100% height. This prevents each file item taking up
 * ample vertical space and being distributed evenly (vertically).
 */
function setFileTableHeight() {
    //Get the y position of the first item with class=pathContainer
    const pathContainer = document.getElementsByClassName("pathContainer")[0];
    const pathContainerY = pathContainer.getBoundingClientRect().y;
    const pathContainerHeight = pathContainer.getBoundingClientRect().height;
    const pathContainerTotalVerticalPadding = parseInt(window.getComputedStyle(pathContainer).getPropertyValue('padding-top')) + parseInt(window.getComputedStyle(pathContainer).getPropertyValue('padding-bottom'));
    const fileTableTopBuffer = Math.floor((pathContainerY + pathContainerHeight + pathContainerTotalVerticalPadding) * 1.2);
    const viewportHeight = window.innerHeight;
    const fileTableHeight = viewportHeight - fileTableTopBuffer;

    //First, check if the file table will overflow. Compute this by getting the number of <tr> items in the file table, and multiplying it by the height of each <tr> item.
    //If the <tr> item height * number of <tr> items is greater than the height of the file table, then we need to set the height of the file table to the height of the viewport minus the height of the path container.
    //Otherwise, leave height as relative 100%.
    const fileTable = document.getElementById("file-browser");
    const fileTableTrItems = fileTable.getElementsByTagName("tr");
    const fileTableTrItemHeight = fileTableTrItems[0].getBoundingClientRect().height;
    const totalFileTableHeight = fileTableTrItemHeight * fileTableTrItems.length;

    //If the file table height is greater than the viewport height, set the file table height to the viewport height minus the path container height.
    if(totalFileTableHeight <= fileTableHeight) {
        document.getElementById("file-browser-container").style.height = "100%";
        return;
    }

    document.getElementById("file-browser-container").style.height = fileTableHeight + "px";
}

setFileTableHeight();
//Whenever window is resized, set the file table height.
window.addEventListener('resize', setFileTableHeight);

// eslint-disable-next-line no-undef
document.getElementById('btnNavigateUpDirectory').addEventListener('click', navigateUpDirectory);
