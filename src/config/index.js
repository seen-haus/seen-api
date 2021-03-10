const dbConfig = require('./database.config');
const env = require('./../services/environment.service');

module.exports = {
    dbConfig,
    INFURA_PROVIDER: env('INFURA_PROVIDER'),
    PUSHER: {
        appId: env('PUSHER_APPID'),
        key: env('PUSHER_KEY'),
        secret: env('PUSHER_SECRET'),
        useTLS: env('PUSHER_USE_TLS'),
        cluster: env('PUSHER_CLUSTER')
    },
    START_BLOCK: env('START_BLOCK'),
    JWT_SECRET: env('JWT_SECRET'),
};
