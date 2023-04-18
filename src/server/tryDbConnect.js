module.exports = function(pool, dbname) {
    pool.getConnection().then(conn => {
        conn.query("SELECT 1").then((rows) => {
            console.log('\x1b[32m%s\x1b[0m', '[OK] Connected to ' + dbname + ' Database.');
        }).catch(err => {
            console.log('\x1b[31m%s\x1b[0m', '[ERROR] Failed to connect to ' + dbname + ' Database.');
            console.log(err);
            process.exit(1);
        });
    }).catch(err => {
        console.log('\x1b[31m%s\x1b[0m', '[ERROR] Failed to connect to ' + dbname + ' Database.');
        console.log(err);
        process.exit(1);
    });
}