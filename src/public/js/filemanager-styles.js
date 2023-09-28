let v_left_element = document.getElementsByClassName("v-left")[0];
let v_right_element = document.getElementsByClassName("v-right")[0];
let body = document.getElementsByTagName("body")[0];
let vwLastPreserveWidth = window.innerWidth;


//If the window width is less than 200px, hide the left element (tree view) and make the right element full width.
//If the window width goes back to the original width, reset the inline styles.

const window_element_resize_observer = new ResizeObserver(function (entries) {
    // eslint-disable-next-line no-unused-vars
    for (const targetResizeObservers of entries) {
        console.log("The width of left item: " + v_left_element.offsetWidth + "px")
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

                //If the element has a "no-observe" tag, skip it. (<span class="loader" no-observe></span>)
                if(child.hasAttribute("no-observe")) {
                    continue;
                }
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
                child.style.display = "block";
                if (child.children.length > 0) {
                    for (let j = 0; j < child.children.length; j++) {
                        let grandchild = child.children[j];
                        grandchild.style.display = "block";
                        if (grandchild.children.length > 0) {
                            for (let k = 0; k < grandchild.children.length; k++) {
                                let greatgrandchild = grandchild.children[k];
                                greatgrandchild.style.display = "block";
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