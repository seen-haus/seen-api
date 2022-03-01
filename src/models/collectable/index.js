const {
    COLLECTIBLES_TABLE,
    ARTISTS_TABLE,
    CLAIMS_TABLE,
    EVENTS_TABLE,
    NFT_TOKENS_TABLE,
    MEDIA_TABLE,
    FEATURED_DROP_TABLE,
    USERS_TABLE,
    TAG_TO_COLLECTABLE_TABLE,
    TAGS_TABLE,
    SECONDARY_MARKET_LISTINGS,
} = require("./../../constants/DBTables");
const BaseModel = require("./../BaseModel");
const Artist = require("../artist");
const Event = require("../event");
const Media = require("../media");
const User = require("../user");
const Tag = require("../tag");

module.exports = class Collectable extends BaseModel {
    static get tableName() {
        return COLLECTIBLES_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
        const Claim = require("../claim");
        const FeaturedDrop = require("../featured-drop");
        const SecondaryMarketListing = require("../secondary-market-listing");
        return {
            artist: {
                relation: BaseModel.HasOneRelation,
                modelClass: Artist,
                join: {
                    from: `${COLLECTIBLES_TABLE}.artist_id`,
                    to: `${ARTISTS_TABLE}.id`,
                }
            },
            user: {
                relation: BaseModel.HasOneRelation,
                modelClass: User,
                join: {
                    from: `${COLLECTIBLES_TABLE}.user_id`,
                    to: `${USERS_TABLE}.id`,
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
            tags: {
                relation: BaseModel.ManyToManyRelation,
                modelClass: Tag,
                join: {
                    from: `${COLLECTIBLES_TABLE}.id`,
                    through: {
                        from: `${TAG_TO_COLLECTABLE_TABLE}.collectable_id`,
                        to: `${TAG_TO_COLLECTABLE_TABLE}.tag_id`,
                    },
                    to: `${TAGS_TABLE}.id`,
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
            },
            featured_drop: {
                relation: BaseModel.HasOneRelation,
                modelClass: FeaturedDrop,
                join: {
                    from: `${COLLECTIBLES_TABLE}.id`,
                    to: `${FEATURED_DROP_TABLE}.collectable_id`,
                }
            },
            secondaryMarketListings: {
                relation: BaseModel.HasManyRelation,
                modelClass: SecondaryMarketListing,
                join: {
                    from: `${COLLECTIBLES_TABLE}.id`,
                    to: `${SECONDARY_MARKET_LISTINGS}.collectable_id`,
                }
            },
        }
    }
}
