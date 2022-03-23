const { TOKEN_CACHE_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class TokenCacheModel extends BaseModel {
    static get tableName() {
        return TOKEN_CACHE_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
