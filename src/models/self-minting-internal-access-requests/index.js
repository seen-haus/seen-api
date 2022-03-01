const { SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class SelfMintingInternalAccessRequestsTable extends BaseModel {
    static get tableName() {
        return SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE
    }

    static get idColumn() {
        return "id"
    }
    static get nameColumn() {
        return "name"
    }
    static get wallet_addressColumn() {
        return "wallet_address"
    }
    static get emailColumn() {
        return "email"
    }
    static get socialsColumn() {
        return "socials"
    }
}