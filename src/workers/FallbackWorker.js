const Knex = require("knex");
const {dbConfig} = require("./../config");
const {AUCTION, SALE} = require("./../constants/PurchaseTypes");
const {V1, V2} = require("./../constants/Versions");
const {Model} = require("objection");
const {CollectableRepository, EventRepository} = require("./../repositories/index");
const filler = require('./../services/filler.service')
const Web3Service = require('./../services/web3.service')
const NFTV1Abi = require("../abis/v1/NFTSale.json");
const AuctionV1Abi = require("../abis/v1/EnglishAuction.json");

// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

const getActiveCollectables = async () => {
    let collectables = await CollectableRepository.active();
    return collectables.filter(collectable => (collectable.purchase_type === SALE
        ? !collectable.is_sold_out
        : !collectable.winner_address)
        && collectable.contract_address);
}

const checkIfSoldOut = async (collectable) => {
    let service = new Web3Service(collectable.contract_address, NFTV1Abi);
    let isSoldOut = await service.isSoldOut();
    if (isSoldOut) {
        await CollectableRepository.update({is_sold_out: 1}, collectable.id);
    }
    return true
};

const checkIfAuctionIsOver = async (collectable) => {
    const service = new Web3Service(collectable.contract_address, AuctionV1Abi);
    let isOver = await service.isAuctionOver();
    if (isOver) {
        const winner = await EventRepository.getWinner(collectable.id);
        if (!winner) {
            return true;
        }
        await CollectableRepository.update({
            is_sold_out: 1,
            winner_address: winner.wallet_address
        }, collectable.id);
    }
    return true;
};

const run = async() => {
    const collectables = await getActiveCollectables();
    for (const collectable of collectables) {
        // Fill Events
        await filler.fillEvents(collectable);
        switch (collectable.purchase_type) {
            case SALE:
                await checkIfSoldOut(collectable);
                break;
            case AUCTION:
                await checkIfAuctionIsOver(collectable);
                break;
        }
    }
    process.exit();
}

run();
