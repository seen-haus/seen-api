const Controller = require('./Controller');
const {CollectableRepository, FeaturedDropRepository} = require("../repositories");
const {FeaturedDropTransformer} = require("../transformers/");
const {validationResult} = require('express-validator');

class AdminFeaturedDropController extends Controller {

    async update(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }
        const id = req.body.collectable_id;
        let collectableDB = await CollectableRepository.find(id)
        if (!collectableDB) {
            return this.sendError(res, "Not found");
        }

        let featuredDropDB = await FeaturedDropRepository.find(1)
        if (!featuredDropDB) {
            return this.sendError(res, "Not found");
        }

        const payload = {...featuredDropDB, ...req.body, ...{updated_at: new Date()}};
        const transformer = FeaturedDropTransformer;

        const featuredDrop = await FeaturedDropRepository
            .setTransformer(transformer)
            .update(transformer.transform(payload), 1);

        this.sendResponse(res, featuredDrop);
    }

}

module.exports = AdminFeaturedDropController;
