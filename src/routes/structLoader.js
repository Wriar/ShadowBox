import {authenticationEnumLockStates} from '../server/types.js';
import { getUserDirectoryStructure } from '../introspection.js';
export default function structLoaderRoutes(app) {
    app.get('/api/fm-dash/getFolderStructure', async (req, res) => {
        //Check if we are logged in
        if(req.session.sessionLockState !== authenticationEnumLockStates.AUTH_COMPLETE || !req.session.userData[0].username) {
            res.json({code: 1, message: "You are not logged in."});
            return;
        }

        //Verify the CSRF Token
        const presentedCSRFToken = req.query.csrf_token;
        if(req.session.csrf_token !== presentedCSRFToken) {
            res.json({code: 1, message: "CSRF token mismatch."});
            return;
        } else {
            console.log(`Presented CSRF token of ${presentedCSRFToken} matches session token of ${req.session.csrf_token}`)
        }

        const username = req.session.userData[0].username;
        const accountMaster = req.session.decryptedAccountMaster;

        getUserDirectoryStructure(username, accountMaster).then((folderStructure) => {
            res.json({code: 0, message: "OK", folderStructure: folderStructure});
        }).catch((error) => {
            console.error(error);
            res.json({code: 2, message: "Could not get folder structure."});
        });
    });
}