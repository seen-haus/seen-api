const { TAGS_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class TagModel extends BaseModel {
    static get tableName() {
        return TAGS_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
