const BaseEventHandler = require("./BaseEventHandler");
const CoinGeckoService = require('./../services/coingecko.service');
const CoinpaprikaService = require('./../services/coinpaprika.service');
const { sleep } = require('../utils/MiscHelpers');

class CollectableEventHandler extends BaseEventHandler {
    constructor(collectable) {
        super();
        this.collectable = collectable;
    }

    async resolveUsdValue(timestamp, customPaymentCoingeckoId = false, retryCount = 0) {
        let opt = new Date(timestamp);
        let dt = new Date();
        dt.setMinutes(dt.getMinutes() - 10);

        // First check if we have a closely matching ETH price

        if (opt > dt) {
            let price = await CoinGeckoService.getTokenPrice(customPaymentCoingeckoId ? customPaymentCoingeckoId : "eth")
                .catch(async (e) => {
                    console.log(e);
                    if(retryCount <= 10) {
                        await sleep(2000);
                        return await this.resolveUsdValue(timestamp, customPaymentCoingeckoId, retryCount + 1);
                    }
                    return 0;
                });
            if (price > 0) {
                return price;
            }
        }
        opt.setMinutes(opt.getMinutes() - 1);
        let coinPaprikaTime = opt.getTime() - (1000 * 60 * 60 * 2); // subtract 2 hours due to CoinPaprika not allowing minute data queries for free
        let coinPaprikaResponse = await CoinpaprikaService.getTokenPrice(customPaymentCoingeckoId ? customPaymentCoingeckoId : "eth", coinPaprikaTime);
        if(retryCount > 0) {
            console.log("Retried response:", coinPaprikaResponse);
        }
        if(((coinPaprikaResponse === 0) || (coinPaprikaResponse && coinPaprikaResponse.length === 0)) && retryCount <= 10) {
            // console.log({response})
            console.log("Retry Coinpaprika")
            // Add a second onto the timestamp, because if you hit the rate limit requesting a timestamped price
            // Coinpaprika will rate limit that timestamp for 1 minute
            let newTimestamp = new Date(new Date(timestamp).getTime() + 1000);
            await sleep(2000);
            return await this.resolveUsdValue(newTimestamp, customPaymentCoingeckoId, retryCount + 1);
        }
        return coinPaprikaResponse;
    }
}

module.exports = CollectableEventHandler;
