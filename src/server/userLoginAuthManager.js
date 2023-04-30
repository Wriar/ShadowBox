const pool = require('../server/db/instData');
const session = require('express-session');

module.exports = function(app) {
    app.post('/login/auth', async (req, res) => {
        const method = req.body.method;
        const username = req.body.username;
        const password = req.body.password;

        if (method === 'v_username') {
            //Validate with returnUsernameValadidity, return JSON response and Store Session.
            const usernameValadidity = await returnUsernameValadidity(username);
            if (usernameValadidity[0]) {
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

        } else {
            //Invalid Method
            res.json({code: 1, message: 'Invalid Method'});
        }
    });

    async function returnUsernameValadidity(username) {     
        const conn = await pool.getConnection();
        const query = `SELECT username FROM users WHERE username = '${username}'`;
        const rows = await conn.query(query);
        conn.release();
        return [rows.length > 0, rows];
    }
}