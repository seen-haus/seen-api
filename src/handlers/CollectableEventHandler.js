const BaseEventHandler = require("./BaseEventHandler");

class CollectableEventHandler extends BaseEventHandler {
    constructor(collectable) {
        super();
        this.collectable = collectable;
    }
}

module.exports = CollectableEventHandler;
