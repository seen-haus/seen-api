const { TOKEN_CACHE_TABLE, CONSIGNMENT_ID_TO_TICKET_METADATA_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class TokenCacheModel extends BaseModel {
    static get tableName() {
        return TOKEN_CACHE_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        const ConsignmentIdToTicketMetadata = require("../consignment-id-to-ticket-metadata");
        return {
            ticketData: {
                relation: BaseModel.HasOneRelation,
                modelClass: ConsignmentIdToTicketMetadata,
                join: {
                    from: `${TOKEN_CACHE_TABLE}.consignment_id`,
                    to: `${CONSIGNMENT_ID_TO_TICKET_METADATA_TABLE}.consignment_id`,
                }
            },
        }
    }
}
