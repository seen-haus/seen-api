const { ClaimAgainstTokenContractsModel } = require("../models");
const BaseRepository = require("./BaseRepository");

class ClaimAgainstTokenContractsRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return ClaimAgainstTokenContractsModel
    }
}

module.exports = new ClaimAgainstTokenContractsRepository()
