import {authenticationEnumLockStates} from '../server/types.js';
import {getDecryptedUserDirectoryStructure} from '../introspection.js';
import {stateMessages, statusMessages} from '../locale.js';

export default function structLoaderRoutes(app) {
    app.get('/api/fm-dash/getFolderStructure', async (req, res) => {
        //Check if we are logged in
        if(req.session.sessionLockState !== authenticationEnumLockStates.AUTH_COMPLETE || !req.session.userData[0].username) {
            //User is not logged in
            res.json({code: 1, message: stateMessages.NOT_LOGGED_IN});
            return;
        }

        //Verify the CSRF Token
        const presentedCSRFToken = req.query.csrf_token;
        if(req.session.csrf_token !== presentedCSRFToken) {
            //CSRF Token does not match
            res.json({code: 1, message: stateMessages.CSRF_TOKEN_INVALID});
            return;
        }

        const username = req.session.userData[0].username;
        const accountMaster = req.session.decryptedAccountMaster;

        await getDecryptedUserDirectoryStructure(username, accountMaster).then((folderStructure) => {
            res.json({code: 0, message: statusMessages.OK, folderStructure: folderStructure});
        }).catch((error) => {
            //Cannot get folder structure
            console.error(error);
            res.json({code: 2, message: statusMessages.FOLDER_STRUCTURE_FETCH_FAIL});
        });
    });
}