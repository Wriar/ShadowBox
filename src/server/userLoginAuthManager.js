const pool = require('../server/db/instData');
// eslint-disable-next-line no-unused-vars
const session = require('express-session');
const bcrypt = require('bcrypt');

module.exports = function(app) {
    app.post('/login/auth', async (req, res) => {
        const method = req.body.method;
        const username = req.body.username;
        const password = req.body.password;

        if (method === 'v_username') {
            //Validate with returnUsernameValadidity, return JSON response and Store Session.
            await returnUsernameValadidity(username).then((result) => {
                if (result[0]) {
                    req.session.username = username;
                    res.json({
                        code: 0,
                        username: username,
                        usernameValid: true
                    });
                } else {
                    res.json({
                        code: 1,
                        username: username,
                        usernameValid: false
                    });
                }
            });
            
        } else if (method === 'v_pass') {
            //TODO: Validate password, return JSON response and Store Session.

            //Check if username is stored in session
            if (!req.session.username) {
                res.json({
                    code: 1,
                    message: 'Invalid Authorization Flow. Please refresh the page and try your request again.'
                });
                return;
            }

            //Hash the password with bcrypt
            const result = await returnUsernamePasswordValadidity(req.session.username, password);
            if (result[0]) {
                res.json({code: 0, message: 'Success!'});
            } else {
                res.json({code: 1, message: 'Incorrect Password. Please try again!'});
            }


        } else {
            //Invalid Method
            res.json({code: 1, message: 'Invalid Method'});
        }
    });

    async function returnUsernameValadidity(username) {     
        const conn = await pool.getConnection();
        try {
            const rows = await conn.query('SELECT username FROM users WHERE username = ?', [username]);
            console.log("The rows: " + rows);
            return [rows.length > 0, rows[0]];
        } catch (err) {
            console.log(err);
            return [false, null];
        } finally {
            conn.release();
        }
    }

    async function returnUsernamePasswordValadidity(username, passwordPlain) {
        const conn = await pool.getConnection();
        try {
            const rows = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
            console.log("The rows: " + rows);
    
            if (rows.length > 0) {
                const result = await new Promise((resolve, reject) => {
                    console.log("Comparing " + passwordPlain + " to " + rows[0].password + " btw the username is " + username);
                    bcrypt.compare(passwordPlain, rows[0].password, (err, result) => {
                        console.log("The reuslt is " + result)
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
    
                return [result, rows[0]];
            } else {
                return [false, null];
            }
        } catch (err) {
            console.log(err);
            return [false, null];
        } finally {
            conn.release();
        }
    }
}