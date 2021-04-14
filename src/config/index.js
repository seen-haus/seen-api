const dbConfig = require('./database.config');
const env = require('./../services/environment.service');

module.exports = {
    dbConfig,
    INFURA_PROVIDER: env('INFURA_PROVIDER'),
    // PUSHER: {
    //     appId: env('PUSHER_APPID'),
    //     key: env('PUSHER_KEY'),
    //     secret: env('PUSHER_SECRET'),
    //     useTLS: env('PUSHER_USE_TLS'),
    //     cluster: env('PUSHER_CLUSTER')
    // },
    START_BLOCK: env('START_BLOCK'),
    JWT_SECRET: env('JWT_SECRET'),
    AWS: {
        accessKeyId: env('AWS_S3_ACCESS_KEY_ID'),
        secretKey: env('AWS_S3_SECRET_KEY'),
        region: env('AWS_S3_REGION'),
        bucket: env('AWS_S3_BUCKET'),
        cloudfront: env("AWS_CLOUDFRONT_HOST")
    }
};
