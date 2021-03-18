const {CollectableModel} = require("./../models");
const BaseRepository = require("./BaseRepository");
const Pagination = require("./../utils/Pagination");
const types = require("./../constants/Collectables");
const purchaseTypes = require("./../constants/PurchaseTypes");

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


    async paginate(perPage = 10, page = 1, type = null, purchaseType = null) {
        purchaseType = purchaseType ? parseInt(purchaseType) : null;
        const results = await this.model.query().where(function () {
                if (type
                    && Object.values(types).includes(type)) {
                    this.where('type', type);
                }
                if (purchaseType
                    && Object.values(purchaseTypes).includes(purchaseType)) {
                    this.where('purchase_type', purchaseType);
                }
            })
            .withGraphFetched('[artist, media, events]')
            .orderBy('starts_at', 'DESC')
            .page(page - 1, perPage)


        return this.parserResult(new Pagination(results, perPage, page))
    }

    async active() {
        let fromDate = new Date();
        fromDate.setHours(fromDate.getHours() - 1)
        fromDate = fromDate.toISOString();

        const result = await this.model.query()
            .where('starts_at', '<=', fromDate)
            .get();

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }

    async findByContractAddress(contractAddress) {
        const result = await this.model.query()
            .withGraphFetched('[artist, media, events]')
            .where('contract_address', '=', contractAddress)
            .first();
        if (!result) {
            return null;
        }
        return this.parserResult(result)
    }

}

module.exports = new CollectableRepository()
