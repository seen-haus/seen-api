const Knex = require("knex");
const {dbConfig} = require("./../config");
const {AUCTION, SALE} = require("./../constants/PurchaseTypes");
const {V1, V2} = require("./../constants/Versions");
const {Model} = require("objection");
const {CollectableRepository} = require("./../repositories/index");
const CollectableAuctionV1 = require("./watchers/v1/CollectableAuction")
const CollectableAuctionV2 = require("./watchers/v2/CollectableAuction")
const CollectableSaleV1 = require("./watchers/v1/CollectableSale")
const ethers = require('ethers');

// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

const getCollectables = async () => {
    let collectables = await CollectableRepository.active();

    return collectables.filter(collectable => (collectable.purchase_type === SALE
        ? (!collectable.is_sold_out && !collectable.is_closed)
        : !collectable.winner_address)
        && collectable.contract_address
        && ethers.utils.isAddress(collectable.contract_address));
}

let watchers = [];

let init = async () => {
    const collectables = await getCollectables();
    console.log("COLLECTABLES TO LISTEN: ", collectables.length)
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
                    : new CollectableAuctionV2(collectable);
                break;
        }

        try {
            watcher.init();
            watchers.push({watcher, collectableId: collectable.id, collectableContractAddress: collectable.contract_address});
        } catch (e) {
            console.log(e);
            console.log("Watcher DESTROY", collectable.id, collectable.contract_address);
            watcher.destroy();
        }
    });
}

let restartWatchers = async () => {
    console.log("Restarting contract watchers")
    for(let watcherItem of watchers) {
        let {watcher, collectableId, collectableContractAddress} = watcherItem;
        console.log("Watcher DESTROY", {collectableId}, {collectableContractAddress});
        await watcher.destroy();
    }
    watchers = [];
    init();
}

init();

let restartWatchersAfterMinutes = 15;

setInterval(() => {
    // This is done so that if new auctions are added after the worker has started, or if contract addresses are changed for existing auctions
    // They restart will ensure that the worker listens to events on the new auctions/contracts instead of relying on the fallback job
    restartWatchers();
}, 60000 * restartWatchersAfterMinutes)
