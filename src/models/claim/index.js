const {CLAIMS_TABLE, COLLECTIBLES_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");
const Collectable = require("../collectable");

module.exports = class Claim extends BaseModel {
    static get tableName() {
        return CLAIMS_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        return {
            collectable: {
                relation: BaseModel.HasOneRelation,
                modelClass: Collectable,
                join: {
                    from: `${CLAIMS_TABLE}.collectable_id`,
                    to: `${COLLECTIBLES_TABLE}.id`,
                }
            },
        }
    }
}
