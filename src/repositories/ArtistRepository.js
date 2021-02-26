const {ArtistModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class ArtistRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return ArtistModel
    }
}

module.exports = new ArtistRepository()
