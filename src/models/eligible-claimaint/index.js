const {CLAIMS_TABLE, ELIGIBLE_CLAIMANTS_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");
const Claim = require("../claim");

module.exports = class EligibleClaimant extends BaseModel {
    static get tableName() {
        return ELIGIBLE_CLAIMANTS_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        return {
            claim: {
                relation: BaseModel.HasOneRelation,
                modelClass: Claim,
                join: {
                    from: `${ELIGIBLE_CLAIMANTS_TABLE}.claim_id`,
                    to: `${CLAIMS_TABLE}.id`,
                }
            },
        }
    }
}
