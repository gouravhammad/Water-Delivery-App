const mysql = require('mysql')

const connection = mysql.createConnection({
    host:'remotemysql.com',
    user:'7xAfr50b8i',
    password:'FcO7wSxs3Q',
    database:'7xAfr50b8i',
    multipleStatements: true
})

connection.connect()

setInterval(keepAlive, 180000);
function keepAlive() {
    connection.query('SELECT 1');
    console.log("Fired Keep-Alive");
    return;
}

module.exports = connection