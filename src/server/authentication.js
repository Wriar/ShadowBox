module.exports = function(app) {

    app.post('/login/auth', (req, res) => {
        const method = req.body.method;

        switch(method) {

            //We want to verify if the username is correct. This is performed after a password check.
            case 'v_username': {
                //TODO: Verify the username
                const username = req.body.username;



                req.session.username = username;
                req.session.usernameVerified = true;
                res.send({code: 0, usernameValid: true, username: username});
                break;
            }


            default:
                res.send({code: 1, message: "Invalid method"});
        }
    });
}