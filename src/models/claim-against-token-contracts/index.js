const { CLAIM_AGAINST_TOKEN_CONTRACTS_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class ClaimAgainstTokenContractsModel extends BaseModel {
    static get tableName() {
        return CLAIM_AGAINST_TOKEN_CONTRACTS_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
