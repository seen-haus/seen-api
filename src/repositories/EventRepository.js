const {EventModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class EventRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return EventModel
    }

    async getWinner(collectableId) {
        const result = await this.model.query()
            .where('collectable_id', collectableId)
            .orderBy('value', "DESC")
            .first();

        if (!result) {
            return null;
        }
        return this.parserResult(result)
    }

    // Use when some transactions can contain multiple valid events
    // Meta field can be used to distinguish between multiple valid events within 1 tx hash
    async fetchByTxHashAndMeta(txHash, meta) {
        const result = await this.model.query().where('tx', txHash).where('meta', meta);

        if (result.length === 0) {
            return null;
        }

        return this.parserResult(result[0])
    }
}

module.exports = new EventRepository()
