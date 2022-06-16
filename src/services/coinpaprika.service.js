const CoinpaprikaAPI = require('@coinpaprika/api-nodejs-client');
const {ETH, WBTC, PRO} = require("./../constants/Tokens");
const LeakyBucket = require("./../services/leakybucket.service");

const bucket = new LeakyBucket({
    capacity: 300,
    interval: 60,
});
const getTokenPrice = async (token, timestamp, retryCount = 0) => {
    let coinId;
    let interval;
    switch (token) {
        case ETH:
            coinId = 'eth-ethereum';
            interval = '1h';
            break
        case WBTC:
            coinId = 'wbtc-wrapped-bitcoin';
            interval = '1h';
            break
        case PRO:
            coinId = 'pro-propy';
            interval = '1h';
            break
    }
    console.log({coinId})

    await bucket.throttle();
    let params = {
        coinId,
        historical: {
            quote: "usd",
            start: (timestamp / 1000).toString(),
            limit: 1,
            interval: interval
        },
    };
    let response = await (new CoinpaprikaAPI())
        .getAllTickers(params).catch(async (e) => {
            console.log(e);
            return 0;
        });

    if (response == 0 || response.length === 0 || !response) {
        return response
    }
    if(response.error) {
        return 0;
    }
    return parseFloat(response[0].price);
};

module.exports = {
    getTokenPrice
}
