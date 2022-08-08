const { SelfMintingInternalAccessRequests } = require("../models");
const BaseRepository = require("./BaseRepository");
const Pagination = require("./../utils/Pagination");

class SelfMintingInternalAccessRequestsRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return SelfMintingInternalAccessRequests
    }

    async paginate(perPage = 10, page = 1, query = {}) {
        const results = await this.model.query()
            .orderBy('id', 'DESC')
            .page(page - 1, perPage)

        return this.parserResult(new Pagination(results, perPage, page))
    }
}

module.exports = new SelfMintingInternalAccessRequestsRepository()
