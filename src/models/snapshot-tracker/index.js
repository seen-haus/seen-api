const { SNAPSHOT_TRACKER_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class SnapshotTrackerModel extends BaseModel {
    static get tableName() {
        return SNAPSHOT_TRACKER_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
