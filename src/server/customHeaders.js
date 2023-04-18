function customHeaders(req, res, next) {
    res.setHeader('X-Powered-By', 'ShadowBox Server V01');
    next();
}

module.exports = customHeaders(req, res, next)