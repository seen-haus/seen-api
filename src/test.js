const {dbConfig} = require("./config");
const mysql = require('mysql');
const fs = require('fs');

const connection = mysql.createConnection({
    connectionLimit: 20,
    host: dbConfig.connection.host,
    user: dbConfig.connection.user,
    password: dbConfig.connection.password,
    database: dbConfig.connection.database,
    port: dbConfig.connection.port,
});

const init = async () => {
    const query = `select * from users`
    connection.connect();
    await connection.query(query, (error, results, fields) => {
        console.log(error, results)
    });
    connection.end()
}

init();
