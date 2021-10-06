const {USERS_TABLE, COLLECTIBLES_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");

module.exports = class User extends BaseModel {
    static get tableName() {
        return USERS_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        const Collectible = require("../collectable");
        return {
             collectables: {
                relation: BaseModel.HasManyRelation,
                modelClass: Collectible,
                join: {
                    from: `${USERS_TABLE}.id`,
                    to: `${COLLECTIBLES_TABLE}.user_id`,
                }
            }
        }
    }
}
