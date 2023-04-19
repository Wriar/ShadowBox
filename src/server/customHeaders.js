function customHeaders(req, res, next) {
    console.log("setting headers!");
    //Disable X-Powered-By header

    res.setHeader('X-Powered-By', 'ShadowBox Server V01');
    next();
}

module.exports = customHeaders;