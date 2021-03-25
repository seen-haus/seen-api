const {ArtistModel} = require("./../models");
const BaseRepository = require("./BaseRepository");
const Pagination = require("./../utils/Pagination");

class ArtistRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return ArtistModel
    }

    async paginate(perPage = 10, page = 1) {
        const results = await this.model.query()
            .withGraphFetched('collectables')
            .orderBy('id', 'DESC')
            .page(page - 1, perPage)

        return this.parserResult(new Pagination(results, perPage, page))
    }

    async search(query) {
        const results = await this.model.query().whereRaw('name LIKE ?', [`%${query}%`]);
        return this.parserResult(results)
    }
}

module.exports = new ArtistRepository()
