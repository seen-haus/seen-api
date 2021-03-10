const {MEDIA_TABLE} = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class Media extends BaseModel {
    static get tableName() {
        return MEDIA_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
