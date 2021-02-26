const {SPOTLIGHT_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");

module.exports = class NFTToken extends BaseModel {
    static get tableName() {
        return SPOTLIGHT_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
