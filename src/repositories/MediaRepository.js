const {MediaModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class MediaRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return MediaModel
    }
}

module.exports = new MediaRepository()
