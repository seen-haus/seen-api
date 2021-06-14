const {FeaturedDropModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class FeaturedDropRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return FeaturedDropModel
    }
}

module.exports = new FeaturedDropRepository()
