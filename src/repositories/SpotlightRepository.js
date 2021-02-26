const {SpotlightModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class SpotlightRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return SpotlightModel
    }
}

module.exports = new SpotlightRepository()
