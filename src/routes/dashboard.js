import {authenticationEnumLockStates} from '../server/types.js';


export default function dashboardRoute(app) {
    app.get('/filemanager', (req, res) => {
        if(req.session.sessionLockState !== authenticationEnumLockStates.AUTH_COMPLETE || !req.session.userData[0].username) {
            res.redirect('/login');
            return;
        }

        res.render('filemanager', {
            footer_copyright_text:
                '&copy; ShadowBox 2023. For Internal Use Only',
            csrf_token:
                req.session.csrf_token
        });
    });
}