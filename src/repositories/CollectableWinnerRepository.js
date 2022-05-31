const {CollectableWinnerModel} = require("./../models");
const BaseRepository = require("./BaseRepository");
const Pagination = require("./../utils/Pagination");

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

    async findByWalletAddressAndCatContractRef(walletAddress, catContractRef) {
        const result = await this.model.query()
            .where('wallet_address', walletAddress)
            .where('cat_contract_ref', catContractRef)
            .first();

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }

    async findByWalletAddressAndCollectableId(walletAddress, collectableId) {
        const result = await this.model.query()
            .where('wallet_address', walletAddress)
            .where('collectable_id', collectableId)
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

    async findByCollectableId(collectableId) {
        const result = await this.model.query()
            .where('collectable_id', collectableId)
            .withGraphFetched('[collectable]')
        return this.parserResult(result)
    }

    async paginate(perPage = 5, page = 1, query = {}) {
        // let collectableId = query.collectableId ? parseInt(query.collectableId) : null;

        const results = await this.model.query()
            // TODO
            // .where(function () {
            //     if (collectableId) {
            //         this.where('collectable_id', collectableId);
            //     }
            // })
            .withGraphFetched('[collectable]')
            .orderBy('id', 'DESC')
            .page(page - 1, perPage)

        return this.parserResult(new Pagination(results, perPage, page))
    }

}

module.exports = new CollectableWinnerRepository()
