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
        }

        if (window.innerWidth > vwLastPreserveWidth) {
            vwLastPreserveWidth = -1;
            //Reset the inline styles.
            v_left_element.classList.remove("hidden");
            v_right_element.classList.remove("fullwidth");
        }
    }
});

window_element_resize_observer.observe(body);