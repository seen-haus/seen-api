const { SecondaryMarketListingModel } = require("./../models");
const BaseRepository = require("./BaseRepository");
const Pagination = require("./../utils/Pagination");
const types = require("./../constants/Collectables");
const purchaseTypes = require("./../constants/PurchaseTypes");

class SecondaryMarketListingRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return SecondaryMarketListingModel
    }

    async paginate(perPage = 10, page = 1, query = {}) {
        let purchaseType = query.purchaseType ? parseInt(query.purchaseType) : null;
        let userId = query.userId ? parseInt(query.userId) : null;
        let type = query.type;
        let excludeEnded = query.excludeEnded ? query.excludeEnded : null;
        let excludeLive = query.excludeLive ? query.excludeLive : null;
        let excludeComingSoon = query.excludeComingSoon ? query.excludeComingSoon : null;
        let awaitingReserveBid = query.awaitingReserveBid ? query.awaitingReserveBid : null;
        let soldOut = query.soldOut ? query.soldOut : null;
        let secondaryMarketListingModel = this.model;
        let currentDate = new Date();

        const results = await this.model.query().where(function () {
                if (type
                    && Object.values(types).includes(type)) {
                    this.where('type', type);
                }
                if (userId) {
                    this.where('user_id', userId);
                }
                if (purchaseType
                    && Object.values(purchaseTypes).includes(purchaseType)) {
                    this.where('purchase_type', purchaseType);
                }
                if(excludeComingSoon) {
                    this.where('starts_at', '<', currentDate);
                }
                if(excludeEnded) {
                    this.where('is_sold_out', '!=', 1);
                    this.where(function () {
                        this.where('ends_at', '>', currentDate);
                        this.orWhere('ends_at', null);
                    })
                }
                if(excludeLive) {
                    this.where('ends_at', '<', currentDate);
                    this.orWhere('is_closed', true);
                }
                if(awaitingReserveBid) {
                    this.whereNotExists(secondaryMarketListingModel.relatedQuery('events'));
                    this.where('purchase_type', purchaseTypes.AUCTION);
                    this.where('starts_at', '<', currentDate);
                }
                if(soldOut) {
                    this.where('is_closed', 1);
                }
            })
            .withGraphFetched('[user, collectable.[tags, media], events]')
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

    async findBySlug(contractAddress) {
        const result = await this.model.query()
            .withGraphFetched('[user.[collectables], collectable.[tags, media], events]')
            .where('slug', '=', contractAddress)
            .first();
        if (!result) {
            return null;
        }
        return this.parserResult(result)
    }

    async findById(id) {
        const result = await this.model.query()
            .withGraphFetched('[user.[collectables], collectable.[tags, media], events]')
            .where('id', '=', id)
            .first();
        if (!result) {
            return null;
        }
        return this.parserResult(result)
    }

    async findByConsignmentId(id) {
        const result = await this.model.query()
            .withGraphFetched('[user.[collectables], collectable.[tags, media], events]')
            .where('consignment_id', '=', id)
            .first();
        if (!result) {
            return null;
        }
        return this.parserResult(result)
    }

}

module.exports = new SecondaryMarketListingRepository()
