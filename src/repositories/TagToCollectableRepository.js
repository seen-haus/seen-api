const { TagToCollectableModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class TagToCollectableRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return TagToCollectableModel
    }
}

module.exports = new TagToCollectableRepository()
