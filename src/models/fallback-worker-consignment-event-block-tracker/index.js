const { FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class FallbackWorkerConsignmentEventBlockTracker extends BaseModel {
    static get tableName() {
        return FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE
    }

    static get idColumn() {
        return "id"
    }

}
