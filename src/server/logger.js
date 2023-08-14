/**
 * Logs & entrusts an log to the application. Codes will be processed accordingly.
 * @param {Number} code Log Code (0=Info, 1=Warning, 2=Error, 3=Fatal Error, 4=Security Error)
 * @param {String} message Friendly Message of the Error
 * @param {Error} [error] Optional Error Object
 */
function createLog(code, message, error) {
    //TODO: Make it do more stuff
    console.log(`[${code}] ${message}`);
    if (error) console.log(error);

    return 0;
}

export default createLog;