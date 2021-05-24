const {
    COLLECTIBLES_TABLE,
    ARTISTS_TABLE,
    CLAIMS_TABLE,
    EVENTS_TABLE,
    NFT_TOKENS_TABLE,
    MEDIA_TABLE
} = require("./../../constants/DBTables");
const BaseModel = require("./../BaseModel");
const Artist = require("../artist");
const Event = require("../event");
const Media = require("../media");
const Claim = require("../claim");

module.exports = class Collectable extends BaseModel {
    static get tableName() {
        return COLLECTIBLES_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        return {
            artist: {
                relation: BaseModel.HasOneRelation,
                modelClass: Artist,
                join: {
                    from: `${COLLECTIBLES_TABLE}.artist_id`,
                    to: `${ARTISTS_TABLE}.id`,
                }
            },
            events: {
                relation: BaseModel.HasManyRelation,
                modelClass: Event,
                join: {
                    from: `${COLLECTIBLES_TABLE}.id`,
                    to: `${EVENTS_TABLE}.collectable_id`,
                }
            },
            media: {
                relation: BaseModel.HasManyRelation,
                modelClass: Media,
                join: {
                    from: `${COLLECTIBLES_TABLE}.id`,
                    to: `${MEDIA_TABLE}.collectable_id`,
                }
            },
            bundleChildItems: {
                relation: BaseModel.HasManyRelation,
                modelClass: Collectable,
                join: {
                    from: `${COLLECTIBLES_TABLE}.bundle_parent_id`,
                    to: `${COLLECTIBLES_TABLE}.bundle_child_id`,
                }
            },
            claim: {
                relation: BaseModel.HasOneRelation,
                modelClass: Claim,
                join: {
                    from: `${COLLECTIBLES_TABLE}.id`,
                    to: `${CLAIMS_TABLE}.collectable_id`,
                }
            }
        }
    }
}
