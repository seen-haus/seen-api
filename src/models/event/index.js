const {EVENTS_TABLE, COLLECTIBLES_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");
const Collectible = require("../collectable");

module.exports = class Event extends BaseModel {
    static get tableName() {
        return EVENTS_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        return {
            collectible: {
                relation: BaseModel.HasOneRelation,
                modelClass: Collectible,
                join: {
                    from: `${EVENTS_TABLE}.collectable_id`,
                    to: `${COLLECTIBLES_TABLE}.id`,
                }
            }
        }
    }
}
