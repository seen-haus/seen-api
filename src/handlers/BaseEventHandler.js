
class BaseEventHandler {
    // async createOrUpdateOptionPrice(optionId, data) {
    //     let item = await OptionPriceRepository.findByOptionId(optionId);
    //
    //     if (item) {
    //         // This is in case of refill, Chainlink price doesn't get overridden by 3rd party prices.
    //         if (!process.env.FORCE_UPDATE) {
    //             Object.keys(data)
    //                 .forEach(key => {
    //                     if (item[key]) {
    //                         data[key] = item[key];
    //                     }
    //                 });
    //         }
    //
    //         return await OptionPriceRepository.update(data, item.id)
    //             .catch(e => {
    //                 console.error(e);
    //                 return false;
    //             });
    //     }
    //
    //     return await OptionPriceRepository.create(data)
    //         .catch(e => {
    //             console.error(e);
    //             return false;
    //         });
    // }
    //
    // async resolveTokenPrice(pool, timestamp) {
    //     let opt = new Date(timestamp);
    //     let dt = new Date();
    //     dt.setMinutes(dt.getMinutes() - 10);
    //     if (opt > dt) {
    //         let price = await ChainlinkServie.getTokenPrice(pool);
    //         console.log("ChainlinkService", price)
    //         if (price === 0) {
    //             price = CoinGeckoService.getTokenPrice(pool)
    //                 .catch(e => {
    //                     console.log(e);
    //                     return 0;
    //                 });
    //             console.log("Coingecko", price)
    //         }
    //         return price;
    //     }
    //
    //     // HOTFIX: to be a little bit more in sync with hegic's analytics "fix"
    //     opt.setMinutes(opt.getMinutes() - 1);
    //     return await CoinpaprikaService
    //         .getTokenPrice(pool, opt.getTime());
    // }
    //
    // async updateOption(id, data) {
    //     return await OptionRepository.setTransformer(OptionTransformer)
    //         .update(data, id)
    //         .catch(e => {
    //             console.error(e);
    //             return false;
    //         });
    // }
    //
    // async createOption(data) {
    //     return await OptionRepository.setTransformer(OptionTransformer)
    //         .create(data)
    //         .catch(e => {
    //             console.error(e);
    //             return false;
    //         });
    // }
    //
    // async findOption(pool, optionId) {
    //     return await OptionRepository.setTransformer(OptionTransformer)
    //         .findByPoolAndOption(pool, optionId)
    //         .catch(e => {
    //             console.error(e);
    //             console.log("FFFAAAAA");
    //             return false;
    //         });
    // }
    //
    // async findOrCreateUser(walletAddress) {
    //     let user = await UserRepository.findByAddress(walletAddress);
    //     if (!user) {
    //         user = await UserRepository
    //             .create({wallet_address: walletAddress})
    //             .catch(e => {
    //                 console.error(e);
    //                 return false;
    //             });
    //     }
    //
    //     return user;
    // }
    //
    // async createOrUpdateSM(data) {
    //     let secondaryMarket = await SecondaryMarketRepository
    //         .findByMultipleParams(data.option_id, data.user_id, data.action, data.txn_hash);
    //     if (!secondaryMarket) {
    //         secondaryMarket = await SecondaryMarketRepository
    //             .create(data)
    //             .catch(e => {
    //                 console.error(e);
    //                 return false;
    //             });
    //     }
    //
    //     return await SecondaryMarketRepository
    //         .update(data, secondaryMarket.id)
    //         .catch(e => {
    //             console.error(e);
    //             return false;
    //         });
    // }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        })
    }
}

module.exports = BaseEventHandler;
