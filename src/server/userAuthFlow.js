import instanceDataPool from './db/instData.js';
import createLog from './logger.js';
import { authenticationEnumLockStates } from './types.js';
//import bcrypt from 'bcrypt';

/**
 * Given a username, asynchronously returns whether or not the username is valid or not from the DataBase.
 * @param {String} username Requested User's Username
 * @returns {Array} [Boolean, Boolean] Boolean: Whether the request succeeded, Boolean: Whether the username is valid.
 */
async function returnUsernameValidity(username) {
    let conn;
    try {
        conn = await instanceDataPool.getConnection();
        const [rows] = await conn.query('SELECT username FROM accounts WHERE username = ?', [username]);
        console.log(rows);
        if (rows !== undefined) {
            //Username was found!
            return [true, true];
        } else {
            //Username was not found.
            return [true, false];
        }
    } catch (err) {
        createLog(3, "Could not complete login account query.", err)
        console.error(err);
        return [false, null];
    } finally {
        if (conn) {
            conn.release();
        }
    }
}



export default function configureLoginRoutes(app) {
    app.post('/login/auth', async (req, res) => {
        const method = req.body.method;

        switch (method) {
            // We want to verify if the username is correct. This is performed after a password check.
            case 'v_username': {
                const username = req.body.username;

                try {
                    const [success, usernameFound] = await returnUsernameValidity(username);
                    if (!success) {
                        res.json({ code: 2, message: "Could not log in at this time. Please try again later." });
                        return;
                    }

                    if(!usernameFound) {
                        res.json({code: 1, message: "Invalid Username. Please try again."});
                        return;
                    }

                    req.session.username = username;
                    req.session.usernameVerified = true;
                    req.session.sessionLockState = authenticationEnumLockStates.AWAIT_PASSWORD;
                    res.send({ code: 0, usernameValid: true, username: username });
                    return;
                } catch (error) {
                    console.error(error);
                    res.json({ code: 2, message: "Could not log in at this time. Please try again later." });
                }

                break;
            }

            case "v_pass": {
                const password = req.body.password;

                //Verify that the page is on the correct state.
                if(req.session.sessionLockState !== authenticationEnumLockStates.AWAIT_PASSWORD) {
                    res.json({code: 1, message: "Invalid request. Please refresh the page."});
                    return;
                }

                res.json({code: 1, message: `yipee ${password}!`});
                break;

            }

            default:
                res.send({ code: 1, message: "Invalid method" });
        }
    });
}
