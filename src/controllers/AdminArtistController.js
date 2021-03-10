const Controller = require('./Controller');
const ArtistTransformer = require("../transformers/artist/");
const ArtistOurputTransformer = require("../transformers/artist/output");
const {ArtistRepository} = require("../repositories")
const {validationResult} = require('express-validator');


class AdminArtistController extends Controller {

    async store(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const artist = await ArtistRepository
            .setTransformer(ArtistOurputTransformer)
            .create(ArtistTransformer.transform(req.body));

        this.sendResponse(res, artist);
    }

    async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }
        const id = req.params.id;
        let artist = await ArtistRepository.find(id)
        if (!artist) {
            return this.sendError(res, "Not found");
        }

        artist = await ArtistRepository
            .setTransformer(ArtistOurputTransformer)
            .update(ArtistTransformer.transform(req.body), artist.id);

        this.sendResponse(res, artist);
    }

    async delete(req, res) {
        const id = req.params.id;
        const artist = await ArtistRepository.find(id)
        if (!artist) {
            return this.sendError(res, "Not found");
        }

        await ArtistRepository.delete(artist.id)

        this.sendResponse(res, {success:true});
    }
}

module.exports = AdminArtistController;
