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

    async paginate(perPage = 10, page = 1, query = {}) {
        let purchaseType = query.purchaseType ? parseInt(query.purchaseType) : null;
        let artistId = query.artistId ? parseInt(query.artistId) : null;
        let includeIsHiddenFromDropList = query.includeIsHiddenFromDropList === 'true' ? true : false;
        let bundleChildId = query.bundleChildId ? query.bundleChildId : null;
        let collectionName = query.collectionName ? query.collectionName : null;
        let excludeEnded = query.excludeEnded ? query.excludeEnded : null;
        let type = query.type;

        const results = await this.model.query().where(function () {
                if (type
                    && Object.values(types).includes(type)) {
                    this.where('type', type);
                }
                if (artistId) {
                    this.where('artist_id', artistId);
                }
                if (purchaseType
                    && Object.values(purchaseTypes).includes(purchaseType)) {
                    this.where('purchase_type', purchaseType);
                }
                if (!includeIsHiddenFromDropList) {
                    this.where('is_hidden_from_drop_list', false);
                }
                if (bundleChildId) {
                    this.where('bundle_child_id', bundleChildId);
                }
                if(collectionName) {
                    this.where('collection_name', collectionName);
                }
                if(excludeEnded) {
                    const currentDate = new Date();
                    this.where((builder) => 
                      builder.where((builder) =>
                          builder.where('ends_at', '>', currentDate)
                          .orWhere('ends_at', null)
                      )
                      .andWhere('is_closed', false)
                      .andWhere('is_sold_out', false)
                    );
                }
            })
            .withGraphFetched('[artist, media, events, bundleChildItems.[events], claim, featured_drop]')
            .orderBy('starts_at', 'DESC')
            .page(page - 1, perPage)


        return this.parserResult(new Pagination(results, perPage, page))
    }

    async active() {
        let fromDate = new Date();
        fromDate.setHours(fromDate.getHours() + 1)
        fromDate = fromDate.toISOString();
        console.log("From date => ", fromDate)
        const result = await this.model.query()
            .where('starts_at', '<=', fromDate);

        return this.parserResult(result)
    }

    async findByContractAddress(contractAddress) {
        const result = await this.model.query()
            .withGraphFetched('[artist.[collectables], media, events, claim]')
            .where('contract_address', '=', contractAddress)
            .first();
        if (!result) {
            return null;
        }
        return this.parserResult(result)
    }

    async findBySlug(contractAddress) {
        const result = await this.model.query()
            .withGraphFetched('[artist.[collectables], media, events, claim]')
            .where('slug', '=', contractAddress)
            .first();
        if (!result) {
            return null;
        }
        return this.parserResult(result)
    }

    async findById(id) {
        const result = await this.model.query()
            .withGraphFetched('[artist.[collectables], media, events, claim]')
            .where('id', '=', id)
            .first();
        if (!result) {
            return null;
        }
        return this.parserResult(result)
    }

    async queryByTokenIds(tokenIds) {
        const results = await this.model.query()
            .withGraphFetched('[artist, media, events, claim]')
            .where('nft_contract_address', '0x13bAb10a88fc5F6c77b87878d71c9F1707D2688A')
            .whereIn('nft_token_id', tokenIds);

        return this.parserResult(results);
    }

}

module.exports = new CollectableRepository()
