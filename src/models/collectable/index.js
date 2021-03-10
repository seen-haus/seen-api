const {COLLECTIBLES_TABLE, ARTISTS_TABLE, EVENTS_TABLE, NFT_TOKENS_TABLE, MEDIA_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");
const Artist = require("../artist");
const Event = require("../event");
const Media = require("../Media");

module.exports = class Collectable extends BaseModel {
    static get tableName() {
        return COLLECTIBLES_TABLE
    }

    static get idColumn() {
        return "id"
    }

    get isPast() {
        let date = new Date();
        date.setHours(date.getHours() + 6)
        const total = this.ends_at  - (date / 1000);
        return total < 0
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
            }
        }
    }
}
