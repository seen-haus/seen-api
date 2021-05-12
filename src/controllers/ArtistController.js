const Controller = require('./Controller');
const {ArtistRepository} = require("./../repositories");
const ArtistOutputTransformer = require("../transformers/artist/output");

class ArtistController extends Controller {

    async index(req, res) {
        const pagination = this.extractPagination(req)
        const includeIsHiddenFromArtistList = req.query.includeIsHiddenFromArtistList;
        const data = await ArtistRepository
            .setTransformer(ArtistOutputTransformer)
            .paginate(pagination.perPage, pagination.page, {includeIsHiddenFromArtistList});

        this.sendResponse(res, data);
    }

    async show(req, res) {
        const slug = req.params.slug;
        let data = await ArtistRepository
            .setTransformer(ArtistOutputTransformer)
            .findByColumn("slug", slug);

        if (!data) {
            data = await ArtistRepository
                .setTransformer(ArtistOutputTransformer)
                .findByColumn("id", slug);
        }

        this.sendResponse(res, data);
    }

    async search(req, res) {
        const query = req.query.q;
        if (!query) {
            return this.sendResponse(res, null);
        }

        const artist = await ArtistRepository.search(query)
        this.sendResponse(res, artist);
    }
}

module.exports = ArtistController;
