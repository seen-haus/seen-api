const {COLLECTIBLE_WINNER_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");

module.exports = class CollectableWinner extends BaseModel {
    static get tableName() {
        return COLLECTIBLE_WINNER_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
