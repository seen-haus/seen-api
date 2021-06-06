const {BID_REGISTRATIONS_TABLE, COLLECTIBLES_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");

module.exports = class BidRegistration extends BaseModel {
    static get tableName() {
        return BID_REGISTRATIONS_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        const Collectable = require("../collectable");
        return {
            collectable: {
                relation: BaseModel.HasOneRelation,
                modelClass: Collectable,
                join: {
                    from: `${BID_REGISTRATIONS_TABLE}.collectable_id`,
                    to: `${COLLECTIBLES_TABLE}.id`,
                }
            },
        }
    }
}
