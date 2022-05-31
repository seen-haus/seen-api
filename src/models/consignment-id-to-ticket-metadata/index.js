const { CONSIGNMENT_ID_TO_TICKET_METADATA_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class ConsignmentIdToTicketMetadataModel extends BaseModel {
    static get tableName() {
      return CONSIGNMENT_ID_TO_TICKET_METADATA_TABLE
    }

    static get idColumn() {
      return "id"
    }
}
