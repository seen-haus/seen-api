const {USERS_TABLE, COLLECTIBLES_TABLE, SECONDARY_MARKET_LISTINGS} = require("./../../constants/DBTables")
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
        const SecondaryMarketListing = require("../secondary-market-listing");
        return {
            collectables: {
                relation: BaseModel.HasManyRelation,
                modelClass: Collectible,
                join: {
                    from: `${USERS_TABLE}.id`,
                    to: `${COLLECTIBLES_TABLE}.user_id`,
                }
            },
            secondaryMarketListings: {
                relation: BaseModel.HasManyRelation,
                modelClass: SecondaryMarketListing,
                join: {
                    from: `${USERS_TABLE}.id`,
                    to: `${SECONDARY_MARKET_LISTINGS}.user_id`,
                }
            }
        }
    }
}
