const CoinpaprikaAPI = require('@coinpaprika/api-nodejs-client');
const {ETH, WBTC} = require("./../constants/Tokens");
const LeakyBucket = require("./../services/leakybucket.service");

const bucket = new LeakyBucket({
    capacity: 300,
    interval: 60,
});
const getTokenPrice = async (token, timestamp) => {
    let coinId;
    switch (token) {
        case ETH:
            coinId = 'eth-ethereum';
            break
        case WBTC:
            coinId = 'wbtc-wrapped-bitcoin';
            break
    }

    console.log(coinId, timestamp)
    await bucket.throttle();
    let params = {
        coinId,
        historical: {
            quote: "usd",
            start: (timestamp / 1000).toString(),
            limit: 1,
            interval: '5m'
        },
    };
    console.log(params)
    let response = await (new CoinpaprikaAPI())
        .getAllTickers(params).catch(e => {
            console.log(e);
            return 0;
        });

    if (response == 0 || response.length === 0 || !response) {
        return response
    }
    console.log(response)
    return parseFloat(response[0].price);
};

module.exports = {
    getTokenPrice
}
