const CollectableEventHandler = require("../CollectableEventHandler");
const {EventRepository} = require("../../repositories");
const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const DateHelper = require("./../../utils/DateHelper");
const {INFURA_PROVIDER} = require("./../../config");
const {BUY} = require("./../../constants/Events");

class PurchaseEventHandler extends CollectableEventHandler {
    constructor(collectable) {
        super(collectable);
    }

    async handle(event, currentIndex, allEvents) {
        const returnValues = event.returnValues;
        const web3 = new Web3(INFURA_PROVIDER)
        let block = await web3.eth.getBlock(event.blockNumber);

        let timestamp = block ? block.timestamp : (new Date() / 1000),
            transactionHash = event.transactionHash,
            amount = returnValues.amount,
            walletAddress = returnValues.buyer;

        let eventDb = await EventRepository.findByColumn('tx', transactionHash);
        if (eventDb) {
            return eventDb;
        }

        let usdValue = 0;
        const collectable = this.collectable;
        let ethValue = parseFloat(new BigNumber(collectable.price).multipliedBy(amount).toNumber());

        try {
            usdValue = await this.resolveUsdValue((new DateHelper).resolveFromTimestamp(timestamp));
            console.log(usdValue)
            usdValue = parseFloat(usdValue) * ethValue;
        } catch (e) {
            console.log(e);
        }
        return await EventRepository.create({
            value: ethValue,
            value_in_usd: usdValue,
            wallet_address: walletAddress,
            collectable_id: collectable.id,
            tx: transactionHash,
            event_type: BUY,
            raw: JSON.stringify(returnValues),
            created_at: (new DateHelper).resolveFromTimestamp(timestamp),
        });
    }
}

module.exports = PurchaseEventHandler;
