const Controller = require('./Controller');
const { BidRegistrationRepository, CollectableRepository } = require("./../repositories");
const {body, validationResult} = require('express-validator');
const Web3Helper = require("./../utils/Web3Helper");
const BidRegistrationOutputTransformer = require("../transformers/bid_registration/output");

class BidRegistrationController extends Controller {

    async isRegistered(req, res) {
        const { collectableId, walletAddress } = req.params;
        if(collectableId && walletAddress) {
            let registeredBidder = await BidRegistrationRepository.checkIsRegisteredBidder(collectableId, walletAddress);
            let registeredStatus = {is_registered: false};
            if(registeredBidder.length > 0) {
                registeredStatus = {is_registered: true};
            }
            this.sendResponse(res, registeredStatus);
        }else{
            this.sendResponse(res, false);
        }
    }

    async register(req, res) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const {
            wallet_address,
            email,
            first_name,
            last_name,
            collectable_id,
            sig
        } = req.body;

        let collectable = await CollectableRepository.findById(collectable_id)
        if (!collectable) {
            return this.sendResponse(res, {errors: errors.array()}, "Not found", 400);
        }

        const msg = `First name: ${first_name}\nLast name: ${last_name}\nEmail: ${email}\nCollectable ID: ${collectable_id}`;
        try {
            let isValidSignature = await Web3Helper.verifySignature(msg, sig, wallet_address);
            if (!isValidSignature) {
                this.sendError(res, "Signature is not valid");
                return;
            }
        } catch (e) {
            this.sendError(res, "Signature is not valid");
            return;
        }

        console.log("valid signature")

        await BidRegistrationRepository.create({
            collectable_id: collectable.id,
            bidder_address: wallet_address,
            first_name,
            last_name,
            email,
            signed_message: sig,
            plaintext_message: msg,
        })

        this.sendResponse(res, []);
    }
}

module.exports = BidRegistrationController;
