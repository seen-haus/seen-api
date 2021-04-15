
const {AWS} = require("../config");

module.exports = {
    replaceHost(url) {
        url = new URL(url);
        url.hostname = AWS.cloudfront;
        // url.pathname = url.pathname.replace("media/", "")
        return url.href
    }
};
