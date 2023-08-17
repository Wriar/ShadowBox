/**
 * Add routes that will be loaded in the application here.
 */

import loginRoute from './routes/login.js';
import userAuthFlow from './server/userAuthFlow.js';

/**
 * Load all routes in the application.
 * @param {Express.Application} app Express Application
 */
export default function loadRoutes(app) {
    loginRoute(app);
    userAuthFlow(app);


    console.log('\x1b[32m%s\x1b[0m', '[OK] Routes loaded successfully.');
    return;
}