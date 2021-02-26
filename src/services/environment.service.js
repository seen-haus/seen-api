const path = require('path');

const env_path = (directory) => path.resolve(__dirname, '../../' + directory);
require('dotenv').config({ path: env_path(".env") });

module.exports = (key, defaultValue) => {
    const value = process.env[key] || defaultValue
    if (typeof value === "undefined") {
        throw new Error(`Environment variable ${key} not set.`)
    }

    return value;
};
