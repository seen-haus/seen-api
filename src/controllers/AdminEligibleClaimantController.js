const Controller = require('./Controller');
const EligibleClaimantTransformer = require("../transformers/eligible_claimant");
const EligibleClaimantOutputTransformer = require("../transformers/eligible_claimant/output");
const {EligibleClaimantRepository} = require("../repositories")
const {validationResult} = require('express-validator');


class AdminEligibleClaimantController extends Controller {

    async store(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const eligibleClaimant = await EligibleClaimantRepository
            .setTransformer(EligibleClaimantOutputTransformer)
            .create(EligibleClaimantTransformer.transform(req.body));

        this.sendResponse(res, eligibleClaimant);
    }

}

module.exports = AdminEligibleClaimantController;
