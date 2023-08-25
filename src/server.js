import express from 'express';
import https from 'https';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
//import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

import createLog from './server/logger.js';
import loadRoutes from './routing.js';
import dbTryConnect from './server/dbTryConnect.js';
import instData from './server/db/instData.js';

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url)); //Allows __dirname to be used

//If the process is run with the -n flag, it will override any database connections which may be restricted under the workflow runner.
const mountDBs = (process.argv[2] && process.argv[2] === '-n') ? true : false;

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
    cookie: { secure: true, maxAge: Number(process.env.COOKIE_MAX_AGE) ?? 1000 * 60 * 60 * 24 * 7 },
    resave: false
}));

// Setup Authentication Options
const certPath = productionStatus ? path.join(__dirname, '../certs/cert.crt') : path.join(__dirname, '../certs/demo_cert.crt');
const keyPath = productionStatus ? path.join(__dirname, '../certs/key.key') : path.join(__dirname, '../certs/demo_key.key');

const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
}

// Log SSL Certificate Setting to Console
productionStatus ? console.log('\x1b[1m\x1b[32m%s\x1b[0m', '[OK] Using Production Certificates') : console.warn('\x1b[1m\x1b[33m%s\x1b[0m', '[WARNING] Using Demo Certificates');
//productionStatus ? app.use(helmet()) : console.warn('\x1b[1m\x1b[33m%s\x1b[0m', '[WARNING] Helmet is disabled in non-production mode.');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('*/static-resx', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'raw')));
app.use(cors());
app.use(compression());

//Load the routes
loadRoutes(app);

// TODO: Load the modules


// Load & Test the database connection
mountDBs && dbTryConnect(instData, "User Database");

console.log('\x1b[36m%s\x1b[0m', '[OK] Initial Configuration Loaded');


if (useHTTPS) {
    https.createServer(httpsOptions, app).listen(443, () => {
        console.log('\x1b[36m%s\x1b[0m', "[OK] HTTPS Server listening on port 443");
        createLog(0, "HTTPS Server has started.");
    });
} else {
    app.listen(port, () => {
        console.log('\x1b[36m%s\x1b[0m', `[OK] HTTP Server listening on port ${port}`);
        createLog(0, "HTTP Server has started.");
    });
}

if (mountDBs) {
    process.exit(0);
}
