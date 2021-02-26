const path = require('path');
const env_path = (directory) => path.resolve("", directory || "");
const src_path = (directory) => path.resolve("src", directory || "");

module.exports = {
    src_path, env_path
}
