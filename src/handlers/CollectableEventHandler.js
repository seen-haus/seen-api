const BaseEventHandler = require("./BaseEventHandler");
const CoinGeckoService = require('./../services/coingecko.service');
const CoinpaprikaService = require('./../services/coinpaprika.service');

class CollectableEventHandler extends BaseEventHandler {
    constructor(collectable) {
        super();
        this.collectable = collectable;
    }

    async resolveUsdValue(timestamp) {
        let opt = new Date(timestamp);
        let dt = new Date();
        dt.setMinutes(dt.getMinutes() - 10);
        if (opt > dt) {
            let price = CoinGeckoService.getTokenPrice("eth")
                .catch(e => {
                    console.log(e);
                    return 0;
                });
            if (price > 0) {
                return price;
            }
        }
        opt.setMinutes(opt.getMinutes() - 1);
        return await CoinpaprikaService
            .getTokenPrice("eth", opt.getTime());
    }
}

module.exports = CollectableEventHandler;
