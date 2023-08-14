/**
 * Establishes a connection to a MySQL database using a provided connection pool and database name,
 * and logs the result of the connection attempt.
 *
 * @param {Object} pool - A MySQL connection pool object.
 * @param {string} dbname - The name of the database to connect to.
 * @returns {void}
 * @throws {Error} If connection to the database fails.
 */

export default function connectToDatabase(pool, dbname) {
    console.log(`[SQLDB] Attempting to connect to '${dbname}'...`);
    pool.getConnection()
        .then(conn => {
            conn.query("SELECT 1")
                .then(() => {
                    console.log('\x1b[32m%s\x1b[0m', `[OK] Connected to ${dbname} Database.`);
                })
                .catch(err => {
                    console.log('\x1b[31m%s\x1b[0m', `[ERROR] Failed to connect to ${dbname} Database.`);
                    console.log(err);
                    process.exit(1);
                });
        })
        .catch(err => {
            console.log('\x1b[31m%s\x1b[0m', `[ERROR] Failed to connect to ${dbname} Database. Please see details below:`);
            console.log(err);
            process.exit(1);
        });
}
