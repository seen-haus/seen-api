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
}

module.exports = new EventRepository()
