const CollectableEventHandler = require("../CollectableEventHandler");
const {EventRepository, CollectableRepository} = require("../../repositories");
const Web3 = require('web3');
const ABI = require("./../../abis/v1/EnglishAuction.json")
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
        let block = await web3.eth.getBlock(event.blockNumber);

        let timestamp = block
            ? block.timestamp
            : parseInt(new Date() / 1000),
            eventId = event.id,
            walletAddress = returnValues.who,
            bid = web3.utils.fromWei(returnValues.amount);

        let eventDb = await EventRepository.findByColumn('event_id', eventId);
        if (eventDb) {
            return eventDb
        }

        const collectable = await CollectableRepository.find(this.collectable.id);
        const endsAtTimestamp = Date.parse(collectable.ends_at) / 1000;
        let needsEndsAtUpdate = (timestamp >= endsAtTimestamp || (endsAtTimestamp - timestamp) <= 300);

        // block timestamp > ends at || diff between endsAtTimestamp and timestamp <= 5min
        if (collectable.min_bid < bid || needsEndsAtUpdate) {
            let endsAt = collectable.ends_at;
            if (needsEndsAtUpdate) {
                const contract = new web3.eth.Contract(ABI, this.collectable.contract_address);
                let startBidTide = await contract.methods.startBidTime().call();
                let auctionLength = await contract.methods.auctionLength().call();
                endsAt = (new DateHelper).resolveFromTimestamp(parseInt(auctionLength) + parseInt(startBidTide))
            }

            await CollectableRepository.update({
                min_bid: collectable.min_bid < bid
                    ? bid
                    : collectable.min_bid,
                ends_at: endsAt
            }, collectable.id);
        }

        let usdValue = 0;
        try {
            usdValue = await this.resolveUsdValue((new DateHelper)
                .resolveFromTimestamp(timestamp));
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
