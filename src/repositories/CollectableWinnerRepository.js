const {CollectableWinnerModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class CollectableWinnerRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return CollectableWinnerModel
    }

    async findByAddress(walletAddress) {
        const result = await this.model.query()
            .where('holder_address', walletAddress)
            .first();

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }

    async findByMultipleParams(optionId, userId, action, txnHash) {
        const result = await this.model.query()
            .where('option_id', optionId)
            .where('action', action)
            .where('txn_hash', txnHash)
            .first();
        return this.parserResult(result)
    }

}

module.exports = new CollectableWinnerRepository()
