const {NFTTokenModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class NFTTokenRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return NFTTokenModel
    }
}

module.exports = new NFTTokenRepository()
