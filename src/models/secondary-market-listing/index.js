const {
  SECONDARY_MARKET_LISTINGS,
  EVENTS_TABLE,
  USERS_TABLE,
  COLLECTIBLES_TABLE,
} = require("./../../constants/DBTables");
const BaseModel = require("./../BaseModel");
const Artist = require("../artist");
const Event = require("../event");
const Media = require("../media");
const User = require("../user");
const Tag = require("../tag");

module.exports = class SecondaryMarketListing extends BaseModel {
  static get tableName() {
      return SECONDARY_MARKET_LISTINGS
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
              from: `${SECONDARY_MARKET_LISTINGS}.collectable_id`,
              to: `${COLLECTIBLES_TABLE}.id`,
          }
        },
        user: {
            relation: BaseModel.HasOneRelation,
            modelClass: User,
            join: {
                from: `${SECONDARY_MARKET_LISTINGS}.user_id`,
                to: `${USERS_TABLE}.id`,
            }
        },
        events: {
            relation: BaseModel.HasManyRelation,
            modelClass: Event,
            join: {
                from: `${SECONDARY_MARKET_LISTINGS}.id`,
                to: `${EVENTS_TABLE}.secondary_market_listing_id`,
            }
        },
      }
  }
}
