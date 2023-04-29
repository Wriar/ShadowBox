const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
//const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');
//const morgan = require('morgan');
const crypto = require('crypto');

console.clear();
console.log('\n');
console.log('\x1b[36m%s\x1b[0m', '[SERVER] Starting server...');

dotenv.config();

//Initiate Express
const app = express();

//Middleware
app.use(cors());

if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

app.use(compression());
app.use(bodyParser.json());
//app.use(morgan('combined'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('*/static-resx', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Require Routes:
require('./routes/fileManager.js')(app);
require('./routes/loginRoutes.js')(app);

//Require Databases:
require("./server/tryDbConnect")(require("./server/db/instData"), "User Database");


//Require Server Modules:
//require('./modules/auth')(app);

const customHeaders = require('./server/customHeaders.js');
app.disable('x-powered-by');
app.use(customHeaders);

//Error Handling Middlware

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.log("Fatal Error emitted from middleware initiliazation: " + err.message);
    console.log("Stack Trace: " + err.stack);
    res.status(500).send("Fatal Error");
});

app.get('/', (req, res) => {
    res.send("ShadowBox Utility!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\x1b[36m%s\x1b[0m`, `[SERVER] Server started on port ${PORT}`);
});

console.log('\x1b[35m%s\x1b[0m', '[REPORT] Attached Advanced Error Reporting');

//404 Route
app.use((req, res) => {
    const correlationId = crypto.randomBytes(16).toString('hex');
    res.status(404).send('<!DOCTYPE html><html>404 - Page Not Found <br> Correlation ID: ' + correlationId + "</html>");
});