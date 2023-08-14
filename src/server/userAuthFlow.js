const instanceDataPool = require('./db/instData');
const bcrypt = require('bcrypt');

/**
 * Given an username, asynchronously returns whether or not the username is valid or not from the DataBase.
 * @param {String} username Requested User's Username
 * @returns {Array} [Boolean, Boolean] Boolean: Whether the request succeeded, Boolean: Whether the username is valid.
 */
async function returnUsernameValidity(username) {     
    const conn = await instanceDataPool.getConnection();
    try {
        const rows = await conn.query('SELECT username FROM accounts WHERE username = ?', [username]);
        return [true, rows.length > 0];
    } catch (err) {
        console.error(err);
        return [false, null];
    } finally {
        conn.release();
    }
}


module.exports = function(app) {

    app.post('/login/auth', async (req, res) => {
        const method = req.body.method;

        switch(method) {

            //We want to verify if the username is correct. This is performed after a password check.
            case 'v_username': {
                //TODO: Verify the username
                const username = req.body.username;

                await returnUsernameValidity(username).then((data) => {
                    if (data[0] === false) {
                        res.json({code: 2, message: "Could not log in at this time. Please try again later."});
                        return;
                    }
                    req.session.username = username;
                    req.session.usernameVerified = true;
                    res.send({code: 0, usernameValid: true, username: username});
                });

                break;
            }


            default:
                res.send({code: 1, message: "Invalid method"});
        }
    });
}

