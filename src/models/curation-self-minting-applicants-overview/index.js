const { CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class CurationSelfMintingApplicantsOverviewModel extends BaseModel {
    static get tableName() {
        return CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE
    }

    static get idColumn() {
        return "id"
    }

}
