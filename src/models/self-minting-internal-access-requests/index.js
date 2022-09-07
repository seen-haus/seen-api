const { 
    SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE,
    CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE
} = require("../../constants/DBTables")
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

    static get relationMappings() {
        const CurationSelfMintingApplicantsOverview = require("../curation-self-minting-applicants-overview");
        return {
            curation_round_overview: {
                relation: BaseModel.HasManyRelation,
                modelClass: CurationSelfMintingApplicantsOverview,
                join: {
                    from: `${SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE}.id`,
                    to: `${CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE}.sm_applicant_id`,
                }
            },
        }
      }
}