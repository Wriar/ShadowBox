/* When Enter is pressed in #username, invoke a click on #btn_userNext */
$('#username').keyup(function(event) {
    if (event.keyCode === 13) {
        // eslint-disable-next-line no-undef
        usernameSubmit();
    }
});