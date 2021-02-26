const {CollectableModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class CollectableRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return CollectableModel
    }

    async findByWinnerAddress(contractAddress, walletAddress) {
        const result = await this.model.query()
            .where('contract_address', contractAddress)
            .where('winner_address', walletAddress)
            .first();

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }

    async bespoke() {

         return this.parserResult(result)
    }
    async active() {
        let fromDate = new Date();
        fromDate.setHours(fromDate.getHours() - 1)
        fromDate = fromDate.toISOString();

        const result = await this.model.query()
            .where('starts_at', '<=' , fromDate)
            .get();

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

module.exports = new CollectableRepository()
