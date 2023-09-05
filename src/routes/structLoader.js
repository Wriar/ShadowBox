import {authenticationEnumLockStates} from '../server/types.js';
import { getUserDirectoryStructure } from '../introspection.js';
export default function structLoaderRoutes(app) {
    app.get('/api/fm-dash/getFolderStructure', async (req, res) => {
        //Check if we are logged in
        if(req.session.sessionLockState !== authenticationEnumLockStates.AUTH_COMPLETE || !req.session.userData[0].username) {
            res.json({code: 1, message: "You are not logged in."});
            return;
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