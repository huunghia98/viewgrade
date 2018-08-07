var mysql = require('mysql');
var connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'namtao123',
    database: 'mydb'
});

module.exports = connection;