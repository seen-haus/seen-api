const {EligibleClaimantModel} = require("./../models");
const BaseRepository = require("./BaseRepository");

class EligibleClaimantRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return EligibleClaimantModel
    }

    async findByAddress(contractAddress, walletAddress) {
        const result = await this.model.query()
            .withGraphJoined('claim.[collectable]')
            .where('claim:collectable.contract_address', contractAddress)
            .where('wallet_address', walletAddress)
            .first();

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }
}

module.exports = new EligibleClaimantRepository()
