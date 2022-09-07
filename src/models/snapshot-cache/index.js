const { SNAPSHOT_CACHE_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class SnapshotCacheModel extends BaseModel {
    static get tableName() {
        return SNAPSHOT_CACHE_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
