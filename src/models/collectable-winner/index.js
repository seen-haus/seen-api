const {COLLECTIBLE_WINNER_TABLE, COLLECTIBLES_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");

module.exports = class CollectableWinner extends BaseModel {
    static get tableName() {
        return COLLECTIBLE_WINNER_TABLE
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
                    from: `${COLLECTIBLE_WINNER_TABLE}.collectable_id`,
                    to: `${COLLECTIBLES_TABLE}.id`,
                }
            },
        }
    }
}
