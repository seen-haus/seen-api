const { IPFS_MEDIA_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class Media extends BaseModel {
    static get tableName() {
        return IPFS_MEDIA_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
