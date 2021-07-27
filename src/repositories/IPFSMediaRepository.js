const {IPFSMediaModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class IPFSMediaRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return IPFSMediaModel
    }
}

module.exports = new IPFSMediaRepository()
