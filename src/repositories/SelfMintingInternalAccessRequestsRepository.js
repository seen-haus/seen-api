const { SelfMintingInternalAccessRequests } = require("../models");
const BaseRepository = require("./BaseRepository");

class SelfMintingInternalAccessRequestsRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return SelfMintingInternalAccessRequests
    }
}

module.exports = new SelfMintingInternalAccessRequestsRepository()
