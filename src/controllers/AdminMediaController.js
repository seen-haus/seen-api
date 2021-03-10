const Controller = require('./Controller');
const {MediaRepository, EventRepository, ArtistRepository} = require("./../repositories");
const CollectableOutputTransformer = require("./../transformers/collectable/output");
const ArtistOutputTransformer = require("./../transformers/artist/output");


class AdminMediaController extends Controller {

    async store(req, res) {
        // position
        // file
        //upload
        //store
        //response
    }

    async positionUpdate(req, res) {
        const id = req.params.id;
        let {
            name,
            url,
            path,
            type,
            position
        } = req.body;
        let media = await MediaRepository.find(id);
        if (!media) {
            return this.sendError(res, "Not Found")
        }

        media = await MediaRepository
            .update({
                name,
                url,
                path,
                type,
                position
            }, id);

        this.sendResponse(res, media);
    }

    async update(req, res) {
        const id = req.params.id;
        let {
            name,
            url,
            path,
            type,
            position
        } = req.body;
        let media = await MediaRepository.find(id);
        if (!media) {
            return this.sendError(res, "Not Found")
        }

        media = await MediaRepository
            .update({
                name,
                url,
                path,
                type,
                position
            }, id);

        this.sendResponse(res, media);
    }

    async delete(req, res) {
        const id = req.params.id;
        let media = await MediaRepository.find(id);
        if (!media) {
            return this.sendError(res, "Not Found")
        }

        await MediaRepository.delete(id);
        this.sendResponse(res, {status: "success"});
    }
}

module.exports = AdminMediaController;
