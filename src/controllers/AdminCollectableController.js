const Controller = require('./Controller');
const {CollectableRepository, ArtistRepository} = require("../repositories");
const {CollectableSaleTangibleTransformer, CollectableAuctionTransformer} = require("../transformers/");
const purchaseTypes = require("../constants/PurchaseTypes");
const fillerService = require("../services/filler.service");
const {validationResult} = require('express-validator');

class AdminCollectableController extends Controller {

    async store(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }
        const payload = req.body;
        const transformer = purchaseTypes.SALE ? CollectableSaleTangibleTransformer : CollectableAuctionTransformer;

        const collectable = await CollectableRepository.setTransformer(transformer).create(payload);

        if (payload.media && payload.media.length > 0) {
            await fillerService.associateMedia(payload.media, collectable)
        }
        this.sendResponse(res, collectable);
    }

    async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }
        const id = req.params.id;
        let artist = await CollectableRepository.find(id)
        if (!artist) {
            return this.sendError(res, "Not found");
        }

        const payload = req.body;
        const transformer = purchaseTypes.SALE ? CollectableSaleTangibleTransformer : CollectableAuctionTransformer;
        const collectable = await CollectableRepository.setTransformer(transformer).update(payload, id);

        // media
        if (payload.media && payload.media.length > 0) {
            await fillerService.associateMedia(payload.media, collectable)
        }

        this.sendResponse(res, collectable);
    }

    async delete(req, res) {
        const id = req.params.id;
        let collectable = await CollectableRepository.find(id)
        if (!collectable) {
            return this.sendError(res, "Not found");
        }

        await CollectableRepository.delete(collectable.id)

        this.sendResponse(res, {success: true});
    }
}

module.exports = AdminCollectableController;
