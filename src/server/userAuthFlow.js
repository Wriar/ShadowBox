import instanceDataPool from './db/instData.js';
import bcrypt from 'bcrypt';
import createLog from './logger.js';
import { authenticationEnumLockStates } from './types.js';
import { loginMessages } from '../locale.js';
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
        if (rows !== undefined) {
            //Username was found!
            return [true, true];
        } else {
            //Username was not found.
            return [true, false];
        }
    } catch (err) {
        createLog(3, "Could not complete login account query (username lookup).", err)
        console.error(err);
        return [false, null];
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

/**
 * Given a username and password, asynchronously returns whether or not the username and password combination is valid or not from the Database.
 * Further returns the rows of the query in **position [2]** of the array.
 * 
 * **This method assumes that the password stored in the database is ``bcrypt`` hashed (12 rounds).**
 * @param {String} username Requested User's Username
 * @param {String} password Requested User's Password
 * @returns {Array} [Boolean, Boolean, Array] Boolean: Whether the request succeeded, Boolean: Whether the username and password combination is valid, Array: Rows of the query.
 */
async function returnUsernamePasswordValidity(username, password) {
    let conn;
    try {
        conn = await instanceDataPool.getConnection();
        const rows = await conn.query('SELECT * FROM accounts WHERE username = ?', [username]);
        let success = false;

        const passwordHashExpectation = rows[0].passwordHash;

        //Compare the password hash with the password provided.
        success = await bcrypt.compare(password, passwordHashExpectation);
        if (success) {
            return [true, success, rows];
        } else {
            //Username & Password combination not found.
            return [true, false, null];
        }
    } catch (err) {
        createLog(2, "Could not complete login account query (user+password).", err)
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
                        res.json({ code: 2, message: loginMessages.SERVER_LOGIN_FAIL });
                        return;
                    }

                    if(!usernameFound) {
                        res.json({code: 1, message: loginMessages.USERNAME_INVALID});
                        return;
                    }

                    req.session.username = username;
                    req.session.usernameVerified = true;
                    req.session.sessionLockState = authenticationEnumLockStates.AWAIT_PASSWORD;
                    res.send({ code: 0, usernameValid: true, username: username });

                    return;
                } catch (error) {
                    console.error(error);
                    res.json({ code: 2, message: loginMessages.SERVER_LOGIN_FAIL });
                }

                break;
            }

            case "v_pass": {
                const password = req.body.password;

                //Verify that the page is on the correct state.
                if(req.session.sessionLockState !== authenticationEnumLockStates.AWAIT_PASSWORD) {
                    res.json({code: 1, message: loginMessages.INVALID_REQUEST_STATE});
                    return;
                }

                const [success, passwordValid, userData] = await returnUsernamePasswordValidity(req.session.username, password);

                if(!success) {
                    res.json({code: 2, message: loginMessages.SERVER_LOGIN_FAIL});
                    return;
                }

                if(!passwordValid) {
                    res.json({code: 1, message: loginMessages.PASSWORD_INVALID});
                    return;
                }

                req.session.userData = userData;
                req.session.loggedIn = true;
                req.session.sessionLockState = authenticationEnumLockStates.AUTH_COMPLETE;

                res.json({code: 0, message: loginMessages.OK});
                break;

            }

            default:
                res.send({ code: 1, message: loginMessages.BAD_METHOD });
        }
    });
}
