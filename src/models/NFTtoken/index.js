const {NFT_TOKENS_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");

module.exports = class NFTToken extends BaseModel {
    static get tableName() {
        return NFT_TOKENS_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
