/* eslint-disable no-unused-vars */
function usernameSubmit() {
    $('#btn_userNext i').hide();
    $('#btn_userNext img').show();
    console.log("Attempting authorization negotiation...")

    const username = $('#username').val();

    //Create Web Request to /login/auth
    $.ajax({
        url: '/login/auth',
        type: 'POST',
        data: {
            username: username,
            method: 'v_username'
        },
        success: function (data) {
            try {
                const usernameValid = data.usernameValid;
                const usernameResponse = data.username;
                if (!usernameValid) {
                    hideShowError(true, "Invalid Username. Please try again.");
                    $('#btn_userNext i').show();
                    $('#btn_userNext img').hide();
                    return;
                }

                hideShowError(); //Hide Error Message (if displayed)
                //Display #password_reveal and hide #username_reveal with fading animation
                $('#username_reveal').fadeOut(500, function () {
                    //Hide Preloaders
                    $('#btn_userNext i').show();
                    $('#btn_userNext img').hide();


                    $('#password_reveal').fadeIn(500);
                    //Show #h_username
                    $('#h_username').show();
                    $('#h_username').text(`Hi, ${usernameResponse}!`); //Set #h_username to username
                });
                

            } catch (ex) {
                hideShowError(true, "Unexpected response from server. Please try again later." + data);
                $('#btn_userNext i').show();
                $('#btn_userNext img').hide();
                console.log("An error occured when attempting to parse server response of " + data);
            }
            
        },
        error: function (xhr, status, error) {
            hideShowError(true, "An error occured when negotiating request with server. Please try again later.");
            $('#btn_userNext i').show();
            $('#btn_userNext img').hide();
            console.log(error);
        }
    });
}

/**
 * Return to the username screen
 */
function returnToUsername() {
    //Clear password
    $('#password').val('');
    
    hideShowError();
    $('#password_reveal').fadeOut(1, function () {
        $('#h_username').hide();
        $('#username_reveal').fadeIn(1);
    });
}

function hideShowError(doShow = false, message) {
    if (doShow) {
        $('#error-text').text(message);
        $('#error-text').show();
    } else {
        $('#error-text').hide();
    }
}