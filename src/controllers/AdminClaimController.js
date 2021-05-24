const Controller = require('./Controller');
const ClaimTransformer = require("../transformers/claim");
const ClaimOutputTransformer = require("../transformers/claim/output");
const {ClaimRepository} = require("../repositories")
const {validationResult} = require('express-validator');


class AdminClaimController extends Controller {

    async store(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const claim = await ClaimRepository
            .setTransformer(ClaimOutputTransformer)
            .create(ClaimTransformer.transform(req.body));

        this.sendResponse(res, claim);
    }

}

module.exports = AdminClaimController;
