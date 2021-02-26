const Knex = require("knex");
const {dbConfig} = require("./../config");
const {AUCTION, SALE} = require("./../constants/PurchaseTypes");
const {V1, V2} = require("./../constants/Versions");
const {Model} = require("objection");
const {CollectableRepository} = require("./../repositories/index");
const CollectableAuctionV1 = require("./watchers/v1/CollectableAuction")
const CollectableSaleV1 = require("./watchers/v1/CollectableSale")

// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

const getCollectables = async () => {
    return await CollectableRepository.active()
        .filter(collectable => !collectable.isPast);
}

let init = async () => {
    const collectables = await getCollectables();
    collectables.forEach(collectable => {
        let watcher = {}
        switch (collectable.purchase_type) {
            case SALE:
                watcher = collectable.version === V1
                    ? new CollectableSaleV1(collectable)
                    : new CollectableSaleV1(collectable);
                break;
            case AUCTION:
                watcher = collectable.version === V1
                    ? new CollectableAuctionV1(collectable)
                    : new CollectableAuctionV1(collectable);
                break;
        }
        try {
            watcher.init();
        } catch (e) {
            console.log("Watcher DESTROY")
            watcher.destroy();
        }
    });
}

init();
