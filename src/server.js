const express = require('express');
const https = require('https');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const crypto = require('crypto');
const createLog = require('./server/logger');
const app = express();

console.log('\n');
console.log('\x1b[33m%s\x1b[0m', '[SERVER] Starting server...');

dotenv.config();

const port = process.env.PORT || 80;
const useHTTPS = process.env.USE_HTTPS || true;
const productionStatus = process.env.PRODUCTION || false;

app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(20).toString('hex'),
    saveUninitialized: true,
    cookie: { secure: true },
    resave: false
}));

//Setup Authentication Options
const keyPath = productionStatus ? './certs/key.key' : './certs/demo_key.key';
const certPath = productionStatus ? './certs/cert.crt' : './certs/demo_cert.crt';

const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('*/sb-shared', express.static(path.join(__dirname, 'public')));

//Recursively load routes from the routes directory O(n) * O(1) = O(n).
function loadRoutes(app, dir) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            loadRoutes(app, filePath); // recursively load routes in subdirectories
        } else if (file.endsWith('.js')) {
            const route = require(filePath);
            if (typeof route === 'function') {
                route(app);
                const relativePath = path.relative(path.join(__dirname, 'routes'), filePath);
                console.log("Routed -> " + relativePath);
                createLog(0, "Routed -> " + relativePath);
            }
        }
    });
}

//Load the routes
loadRoutes(app, path.join(__dirname, 'routes'));

console.log('\x1b[36m%s\x1b[0m', '[OK] Initial Configuration Loaded');

if (useHTTPS) {
    https.createServer(httpsOptions, app).listen(443, () => {
        console.log('\x1b[36m%s\x1b[0m', `[OK] HTTPS Server listening on port 443`);
    });
} else {
    app.listen(port, () => {
        console.log('\x1b[36m%s\x1b[0m', `[OK] HTTP Server listening on port ${port}`);
    });
}