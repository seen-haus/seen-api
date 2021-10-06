const { TagModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class TagRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return TagModel
    }
}

module.exports = new TagRepository()
