const {PUSHER: PUSHER_CONFIG} = require("../../config");
const Pusher = require("pusher");

module.exports = class Watcher {
    constructor(collectable) {
        if (this.init === undefined || collectable === undefined) {
            throw new TypeError("watcher and abi should be defined.");
        }
        this.collectable = collectable;
    }

    formatValue(value) {
        return (value / Math.pow(10, this.watcher.decimals));
    }

    async dispatch(evt, data) {
        try {
            const pusher = new Pusher(PUSHER_CONFIG);
            await pusher.trigger("purchase", evt, data);
        } catch (e) {
            console.log(e)
        }
    }
}
