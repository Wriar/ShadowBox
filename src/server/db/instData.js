const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.MYSQL_DATABASE_HOST,
    user: process.env.MYSQL_DATABASE_USER,
    password: process.env.MYSQL_DATABASE_PASSWORD,
    database: process.env.MYSQL_INSTDATA_DATABASE,
    connectionLimit: 10
});

module.exports = pool;