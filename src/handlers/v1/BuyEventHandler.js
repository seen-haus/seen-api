const CollectableEventHandler = require("../CollectableEventHandler");
const {EventRepository} = require("../../repositories");
const Web3 = require('web3');
const DateHelper = require("./../../utils/DateHelper");
const {INFURA_PROVIDER} = require("./../../config");
const {BUY} = require("./../../constants/Events");

class BuyEventHandler extends CollectableEventHandler {
    constructor(collectable) {
        super(collectable);
    }

    async handle(event) {
        const returnValues = event.returnValues;
        const web3 = new Web3(INFURA_PROVIDER)
        let block = await web3.eth.getBlock(event.blockNumber),
            timestamp = block.timestamp,
            eventId = event.id,
            amount = web3.utils.fromWei(returnValues.amount),
            walletAddress = returnValues.buyer;

        let eventDb = await EventRepository.findByColumn('event_id', eventId);
        if (eventDb) {
            return eventDb;
        }

        const collectable = this.collectable;
        return await EventRepository.create({
            value: amount,
            wallet_address: walletAddress,
            collectable_id: collectable.id,
            event_id: eventId,
            event_type: BUY,
            raw: JSON.stringify(returnValues),
            created_at: (new DateHelper).resolveFromTimestamp(timestamp),
        });
    }
}

module.exports = BuyEventHandler;
