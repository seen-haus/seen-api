const CollectableEventHandler = require("../CollectableEventHandler");
const {EventRepository, CollectableRepository, UserRepository, UserEmailPreferencesRepository} = require("../../repositories");
const {UserEmailPreferencesOutputTransformer, CollectableOutputTransformer} = require("../../transformers");
const Web3 = require('web3');
const ABI = require("./../../abis/v2/EnglishAuction.json")
const { sendOutbidNotification } = require('../../services/sendgrid.service');
const DateHelper = require("./../../utils/DateHelper");
const {INFURA_PROVIDER} = require("./../../config");
const {BID} = require("./../../constants/Events");

// @TODO test
class BidEventHandler extends CollectableEventHandler {
    constructor(collectable) {
        super(collectable);
    }

    async handle(event, currentIndex, allEvents) {
        const returnValues = event.returnValues;
        const web3 = new Web3(INFURA_PROVIDER)
        let block = await web3.eth.getBlock(event.blockNumber);

        let timestamp = block ? block.timestamp : (new Date() / 1000),
            transactionHash = event.transactionHash,
            walletAddress = returnValues.who,
            bid = web3.utils.fromWei(returnValues.amount);

        let eventDb = await EventRepository.findByColumn('tx', transactionHash);
        if (eventDb) {
            return eventDb
        }

        const collectable = await CollectableRepository.setTransformer(CollectableOutputTransformer).findById(this.collectable.id);
        const endsAtTimestamp = Date.parse(collectable.ends_at) / 1000;
        let needsEndsAtUpdate = (timestamp >= endsAtTimestamp || (endsAtTimestamp - timestamp) <= 7200) || isNaN(endsAtTimestamp);
        console.log("NEEDS UPDATE", needsEndsAtUpdate, endsAtTimestamp, timestamp)
        // block timestamp > ends at || diff between endsAtTimestamp and timestamp <= 5min
        if (collectable.min_bid < bid || needsEndsAtUpdate) {
            let endsAt = collectable.ends_at;
            let startsAt = collectable.starts_at;
            if (needsEndsAtUpdate) {
                const contract = new web3.eth.Contract(ABI, this.collectable.contract_address);
                let endTime = await contract.methods.endTime().call();
                console.log(endTime)
                endsAt = (new DateHelper).resolveFromTimestamp(parseInt(endTime))
                if(collectable.is_reserve_price_auction) {
                    // Update startsAt time to cater for reservePrice auctions
                    let startTime = await contract.methods.startTime().call();
                    startsAt = (new DateHelper).resolveFromTimestamp(parseInt(startTime))
                }
            }

            await CollectableRepository.update({
                min_bid: collectable.min_bid < bid
                    ? bid
                    : collectable.min_bid,
                ends_at: endsAt,
                starts_at: startsAt,
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

        if(currentIndex >= 1) {
            const previousBidderAddress = allEvents[currentIndex - 1].returnValues.who;
            const currentBidderAddress = event.returnValues.who;

            let preventOutbidNotification = false;
            let preferencesAllowNotification = false;

            // First check if we have an email address for the previous bidder, and if their notification preferences enable outbid notifications
            let emailAddress = await UserRepository.findEmailByAddress(previousBidderAddress);

            if(emailAddress) {
                let user = await UserRepository.findByAddress(previousBidderAddress);
                // Check notification preferences
                let preferences = await UserEmailPreferencesRepository
                    .setTransformer(UserEmailPreferencesOutputTransformer)
                    .findPreferencesByUserId(user.id);

                if(!preferences) {
                    preventOutbidNotification = true;
                } else if (preferences.global_disable || !preferences.outbid) {
                    // If notifications are globally disabled or outbid notification are disabled, prevent notification
                    preventOutbidNotification = true;
                } else if(!preferences.global_disable && preferences.outbid) {
                    // Somewhat redundant but good as a safeguard against errors
                    preferencesAllowNotification = true;
                }
            } else {
                preventOutbidNotification = true;
            }

            //Check that this isn't the last event, also checks current status to avoid potentially unnecessary for loop
            if(preferencesAllowNotification && !preventOutbidNotification && allEvents.length > (currentIndex + 1)) {
                // Check if the previous bidder has made a subsequent bid since this event
                for(let remainingEvent of allEvents.slice(currentIndex + 1)) {
                    if(remainingEvent.returnValues.who === previousBidderAddress) {
                        // Previous bidder has made a subsequent bid, therefore no need to notify of outbid
                        preventOutbidNotification = true;
                        break;
                    }
                }
            }
            if(previousBidderAddress === currentBidderAddress) {
                // Previous bidder is the same as the current bidder, therefore no need to notify of outbid
                preventOutbidNotification = true;
            }

            // Provided the following, we can send the notification
            if(preferencesAllowNotification && !preventOutbidNotification) {
                let collectableImage = false;
                if(collectable.media && collectable.media.length > 0) {
                    let sortedMedia = [...collectable.media].sort((a, b) => a.position - b.position);
                    for(let media of sortedMedia) {
                        if(media.type && (media.type === 'image/jpeg') || (media.type === 'image/png')) {
                            collectableImage = media && media.url;
                            // Use first image
                            break;
                        }
                    }
                }
                let collectableTitle = collectable.title;
                let slug = collectable.slug;
                let auctionLink = collectable.is_slug_full_route ? `https://seen.haus/${slug}` : `https://seen.haus/drops/${slug}`
                await sendOutbidNotification(emailAddress, auctionLink, collectableTitle, collectableImage);
            }
        }

        return await EventRepository.create({
            wallet_address: walletAddress,
            collectable_id: collectable.id,
            value: bid,
            value_in_usd: usdValue,
            tx: transactionHash,
            event_type: BID,
            raw: JSON.stringify(returnValues),
            created_at: (new DateHelper).resolveFromTimestamp(timestamp),
        });
    }
}

module.exports = BidEventHandler;
