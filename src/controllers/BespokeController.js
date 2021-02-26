const Controller = require('./Controller');
const {CollectableRepository, EventRepository, ArtistRepository} = require("./../repositories");
const CollectableOutputTransformer = require("./../transformers/collectable/output");
const ArtistOutputTransformer = require("./../transformers/artist/output");


class BespokeController extends Controller {

    async index(req, res) {
        const collectables = await CollectableRepository
            .query()
            .withGraphFetched('[artist, nft_token]');

        const events = await EventRepository.all();
        const artists = await ArtistRepository.all();

        this.sendResponse(res, {
            collectables : collectables.map(c => CollectableOutputTransformer.transform(c)),
            artists: artists.map(a => ArtistOutputTransformer.transform(a)),
            events,
        });
    }
}

module.exports = BespokeController;
