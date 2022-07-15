const CoinGecko = require('coingecko-api');
const NodeCache = require("node-cache");

const cache = new NodeCache({stdTTL: 300, useClones: false});

const getTokenPrices = async () => {
    let cacheKey = 'tokenPrices';
    let tokenPrices = cache.get(cacheKey);
    if (tokenPrices) {
        return JSON.parse(tokenPrices);
    }
    const CoinGeckoClient = new CoinGecko();
    let response = await CoinGeckoClient.simple.price({
        ids: ['ethereum', 'propy'],
        vs_currencies: ['usd'],
    });
    let data = {
        eth: 0
    };
    let responseData = response.data;
    if (!responseData) {
        return data
    }
    data.eth = responseData.ethereum.usd;
    cache.set(cacheKey, JSON.stringify(data));

    return data;
};

const getTokenPrice = async(token) => {
    let response = await getTokenPrices();
    return response[token.toLowerCase()];
}

module.exports = {
    getTokenPrices, getTokenPrice
}
