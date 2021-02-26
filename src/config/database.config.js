const env = require('./../services/environment.service');
const {src_path} = require('./../services/global.service');

module.exports =  {
    client: "mysql",
    connection: {
        host: env("DB_HOST"),
        port: env("DB_PORT"),
        database: env("DB_NAME"),
        user: env("DB_USER"),
        password: env("DB_PASS"),
    },
    migrations: {
        tableName: 'migrations_new',
        directory: src_path("database/migrations"),
    }
};
