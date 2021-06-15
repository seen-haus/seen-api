const Controller = require('./Controller');
const {CollectableWinnerRepository} = require("./../repositories");
const {body, validationResult} = require('express-validator');
const CollectableWinnerOutputTransformer = require("../transformers/collectable_winner/output");

class AdminClaimsController extends Controller {

    async index(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }
        const pagination = this.extractPagination(req);
        const data = await CollectableWinnerRepository
            .setTransformer(CollectableWinnerOutputTransformer)
            .paginate(pagination.perPage, pagination.page, {property: 'id', direction: 'DESC'})

        this.sendResponse(res, data);
    }
    
}

module.exports = AdminClaimsController;
