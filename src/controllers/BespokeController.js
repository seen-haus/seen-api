const Controller = require('./Controller');
const {CollectableRepository, ArtistRepository} = require("./../repositories");
const CollectableOutputTransformer = require("./../transformers/collectable/output");
const ArtistOutputTransformer = require("./../transformers/artist/output");


class BespokeController extends Controller {

    async index(req, res) {
        const collectables = await CollectableRepository
            .query()
            .limit(20)
            .withGraphFetched('[artist, media]')
            .orderBy('id', 'DESC');

        const artists = await ArtistRepository
            .query()
            .limit(20)
            .withGraphFetched('[collectables]')
            .orderBy('id', 'DESC');

        this.sendResponse(res, {
            collectables: collectables.map(c => CollectableOutputTransformer.transform(c)),
            artists: artists.map(a => ArtistOutputTransformer.transform(a)),
        });
    }
}

module.exports = BespokeController;
