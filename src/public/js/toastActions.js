/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function generateToast(code, text) {

    let prepend;

    switch (code) {
        case 0:
            prepend = "<i style='color: var(--success);' class='icon-check-circle'></i> ";
            break;
        case 1:
            prepend = "<i style='color: var(--theme-color);' class='icon-info'></i> ";
            break;
        case 2:
            prepend = "<i style='color: var(--warning);' class='icon-alert-triangle'></i> ";
            break;
        case 3:
            prepend = "<i style='color: var(--error);' class='icon-ban'></i> ";
            break;
        default:
            break;
    }
    Toastify({
        text: prepend + text,
        duration: 3000,
        gravity: "bottom",
        position: "center",
        stopOnFocus: true,
        escapeMarkup: false,
        color: "var(--default-text-color)",
        style: {
            background: "var(--background-color)",
            boxShadow: "1px 1px 15px var(--control-hover-color)",
        },
    }).showToast();
}