const CollectableEventHandler = require("../CollectableEventHandler");
const {EventRepository, CollectableRepository} = require("../../repositories");
const {CollectableOutputTransformer} = require("../../transformers");
const DateHelper = require("./../../utils/DateHelper");
const {CLAIM_AGAINST_TOKEN_ID} = require("./../../constants/Events");
const BigNumber = require('bignumber.js');

class ClaimedAgainstTokenIdEventHandler extends CollectableEventHandler {
    constructor(collectable) {
        super(collectable);
    }

    async handle(event, currentIndex, allEvents) {

        const returnValues = event.returnValues;

        let timestamp = returnValues.timestamp,
            transactionHash = event.transactionHash,
            walletAddress = returnValues.claimant,
            claimedAgainstTokenIdString = new BigNumber(returnValues.tokenId).toString();

        let eventDb = await EventRepository.fetchByTxHashAndMeta(transactionHash, claimedAgainstTokenIdString);
        if (eventDb) {
            return eventDb
        }

        const collectable = await CollectableRepository.setTransformer(CollectableOutputTransformer).findById(this.collectable.id);

        let price = collectable.price;

        let usdValue = 0;
        try {
            let customPaymentTokenCoingeckoId = 
                collectable.custom_payment_token && collectable.custom_payment_token.coingecko_id 
                    ? collectable.custom_payment_token.coingecko_id 
                    : false;
            usdValue = await this.resolveUsdValue((new DateHelper)
                .resolveFromTimestamp(timestamp), customPaymentTokenCoingeckoId);
            usdValue = parseFloat(usdValue) * parseFloat(price)
        } catch (e) {
            console.log(e)
        }

        return await EventRepository.create({
            wallet_address: walletAddress,
            collectable_id: collectable.id,
            value: price,
            value_in_usd: usdValue,
            tx: transactionHash,
            event_type: CLAIM_AGAINST_TOKEN_ID,
            meta: claimedAgainstTokenIdString,
            raw: JSON.stringify(returnValues),
            created_at: (new DateHelper).resolveFromTimestamp(timestamp),
        });
    }
}

module.exports = ClaimedAgainstTokenIdEventHandler;
