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
            .withGraphFetched('curation_round_overview')
            .orderBy('id', 'DESC')
            .page(page - 1, perPage)

        return this.parserResult(new Pagination(results, perPage, page))
    }

    async paginateOrderByEffective(perPage = 10, page = 1, roundDeclarationId) {
        const results = await this.model.query()
            .where('curation_inclusion', true)
            .withGraphJoined('curation_round_overview')
            .modifyGraph('curation_round_overview', builder => {
                builder.where('curation_sm_applicants_overview.round_declaration_id', roundDeclarationId);
              })
            .orderBy('curation_round_overview.total_effective', 'DESC')
            .page(page - 1, perPage)

        return this.parserResult(new Pagination(results, perPage, page))
    }
}

module.exports = new SelfMintingInternalAccessRequestsRepository()
