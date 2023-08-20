import createLog from './server/logger.js'

export default function sessionDebugRoute(app) {
    app.get('/sessionDebug', (req, res) => {

        if(process.env.ENABLE_DEBUG_DUMP !== 'True') {
            createLog(4, `Session Debug Route is disabled but is accessed from ${req.ip}.`);
            res.sendStatus(404);
            return;
        }

        if(req.query.key !== process.env.SESSION_SECRET) {
            createLog(4, `Session Debug Route is accessed from ${req.ip} with an invalid key of ${req.query.key}. (Is it properly URl encoded?)`);
            res.sendStatus(403);
            return;
        }
        
        //Send all session data to the client.
        res.json(req.session);
    });


}