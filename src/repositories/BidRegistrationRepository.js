const {BidRegistrationModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class BidRegistrationRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return BidRegistrationModel
    }

    async checkIsRegisteredBidder(collectableId, walletAddress) {
        const result = await this.model.query()
        .where("collectable_id", collectableId)
        .where("bidder_address", walletAddress)

        return this.parserResult(result)
    }
}

module.exports = new BidRegistrationRepository()
