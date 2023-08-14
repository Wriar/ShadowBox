const express = require('express');
const https = require('https');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const crypto = require('crypto');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const createLog = require('./server/logger').default;
const app = express();

console.clear();
console.log('\n');
console.log('\x1b[33m%s\x1b[0m', '[SERVER] Starting server...');

dotenv.config();

const port = process.env.PORT ?? 80;
const useHTTPS = process.env.USE_HTTPS ?? true;
const productionStatus = process.env.PRODUCTION ?? false;


app.use(session({
    secret: process.env.SESSION_SECRET ?? crypto.randomBytes(20).toString('hex'),
    saveUninitialized: true,
    cookie: { secure: true, maxAge: process.env.COOKIE_MAX_AGE ?? 1000 * 60 * 60 * 24 * 7 },
    resave: false
}));

//Setup Authentication Options
const certPath = productionStatus ? path.join(__dirname, '../certs/cert.crt') : path.join(__dirname, '../certs/demo_cert.crt');
const keyPath = productionStatus ? path.join(__dirname, '../certs/key.key') : path.join(__dirname, '../certs/demo_key.key');

const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
}

//Log SSL Certificate Setting to Console
productionStatus ? console.log('\x1b[1m\x1b[32m%s\x1b[0m', '[OK] Using Production Certificates') : console.warn('\x1b[1m\x1b[33m%s\x1b[0m', '[WARNING] Using Demo Certificates');
productionStatus ? app.use(helmet()) : console.warn('\x1b[1m\x1b[33m%s\x1b[0m', '[WARNING] Helmet is disabled in non-production mode.');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('*/static-resx', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'raw')));
app.use(cors());
app.use(compression());


//Recursively load routes from the routes directory.
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

//Load the modules
require('./server/userAuthFlow')(app);

//Load & Test the database connection
require("./server/dbTryConnect")(require("./server/db/instData"), "User Database");


console.log('\x1b[36m%s\x1b[0m', '[OK] Initial Configuration Loaded');

if (useHTTPS) {
    https.createServer(httpsOptions, app).listen(443, () => {
        console.log('\x1b[36m%s\x1b[0m', "[OK] HTTPS Server listening on port 443");
    })
} else {
    app.listen(port, () => {
        console.log('\x1b[36m%s\x1b[0m', `[OK] HTTP Server listening on port ${port}`);
    });
}