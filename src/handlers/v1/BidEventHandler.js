const CollectableEventHandler = require("../CollectableEventHandler");
const {EventRepository, CollectableRepository} = require("../../repositories");
const Web3 = require('web3');
const DateHelper = require("./../../utils/DateHelper");
const {INFURA_PROVIDER} = require("./../../config");
const {BID} = require("./../../constants/Events");

class BidEventHandler extends CollectableEventHandler {
    constructor(collectable) {
        super(collectable);
    }

    async handle(event) {
        const returnValues = event.returnValues;
        const web3 = new Web3(INFURA_PROVIDER)
        let block = await web3.eth.getBlock(event.blockNumber),
            timestamp = block.timestamp,
            eventId = event.id,
            walletAddress = returnValues.who,
            bid = web3.utils.fromWei(returnValues.amount);

        let eventDb = await EventRepository.findByColumn('event_id', eventId);
        if (eventDb) {
            return eventDb
        }

        const collectable = await CollectableRepository.find(this.collectable.id);
        if (collectable.min_bid < bid) {
            await CollectableRepository.update({min_bid: bid}, collectable.id);
        }
        let usdValue = 0;
        try {
            usdValue = await this.resolveUsdValue((new DateHelper).resolveFromTimestamp(timestamp));
            console.log(usdValue)
            usdValue = parseFloat(usdValue) * parseFloat(bid)
            console.log(usdValue)
        } catch (e) {
            console.log(e)
        }

        return await EventRepository.create({
            wallet_address: walletAddress,
            collectable_id: collectable.id,
            value: bid,
            value_in_usd: usdValue,
            event_id: eventId,
            event_type: BID,
            raw: JSON.stringify(returnValues),
            created_at: (new DateHelper).resolveFromTimestamp(timestamp),
        });
    }
}

module.exports = BidEventHandler;
