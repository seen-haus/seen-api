const {ARTISTS_TABLE, COLLECTIBLES_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");
const Collectible = require("../collectable");

module.exports = class Artist extends BaseModel {
    static get tableName() {
        return ARTISTS_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        return {
            collectibles: {
                relation: BaseModel.HasManyRelation,
                modelClass: Collectible,
                join: {
                    from: `${ARTISTS_TABLE}.id`,
                    to: `${COLLECTIBLES_TABLE}.artist_id`,
                }
            }
        }
    }
}
