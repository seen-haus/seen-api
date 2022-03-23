const { TOKEN_HOLDER_BLOCK_TRACKER_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class TokenHolderBlockTrackerModel extends BaseModel {
    static get tableName() {
        return TOKEN_HOLDER_BLOCK_TRACKER_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
