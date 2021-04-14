
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
}
