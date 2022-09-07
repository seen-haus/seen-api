const { CURATION_SELF_MINTING_APPLICANTS_VOTES_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class CurationSelfMintingApplicantsVotesModel extends BaseModel {
    static get tableName() {
        return CURATION_SELF_MINTING_APPLICANTS_VOTES_TABLE
    }

    static get idColumn() {
        return "id"
    }

}
