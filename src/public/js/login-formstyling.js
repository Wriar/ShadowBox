/* When Enter is pressed in #username, invoke a click on #btn_userNext */
$('#username').keyup(function(event) {
    if (event.keyCode === 13) {
        // eslint-disable-next-line no-undef
        usernameSubmit();
    }
});

$('#username').value = '';
$('#username').focus();

//Add event listener to btn_userNext to submit username
$('#btn_userNext').click(function() {
    // eslint-disable-next-line no-undef
    usernameSubmit();
});

//Add event listener to btn_login to submit password
$('#btn_login').click(function() {
    // eslint-disable-next-line no-undef
    passwordSubmit();
});

//Add event lisnter to link_back to return to username screen
$('#link_back').click(function() {
    // eslint-disable-next-line no-undef
    returnToUsername();
});

//Add event listener to #btn_login to submit password when Enter is pressed in #password
$('#password').keyup(function(event) {
    if (event.keyCode === 13) {
        // eslint-disable-next-line no-undef
        passwordSubmit();
    }
}
);

$('#btn_login').click(function() {
    // eslint-disable-next-line no-undef
    passwordSubmit();
});