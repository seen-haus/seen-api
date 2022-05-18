const { TICKET_CACHE_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class TicketCacheModel extends BaseModel {
    static get tableName() {
        return TICKET_CACHE_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
