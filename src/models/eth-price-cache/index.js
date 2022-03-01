const { ETH_PRICE_CACHE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class EthPriceCache extends BaseModel {
    static get tableName() {
        return ETH_PRICE_CACHE
    }

    static get idColumn() {
        return "id"
    }

}
