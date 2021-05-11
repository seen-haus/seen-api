const Controller = require('./Controller');
const {CollectableRepository, CollectableWinnerRepository} = require("./../repositories");
const {body, validationResult} = require('express-validator');
const Web3Helper = require("./../utils/Web3Helper");
const CollectableOutputTransformer = require("../transformers/collectable/output");

class CollectableController extends Controller {

    async index(req, res) {
        const pagination = this.extractPagination(req);
        const type = req.query.type;
        const purchaseType = req.query.purchaseType;
        const artistId = req.query.artistId;
        const includeIsHiddenFromDropList = req.query.includeIsHiddenFromDropList;
        const data = await CollectableRepository
            .setTransformer(CollectableOutputTransformer)
            .paginate(pagination.perPage, pagination.page, {type, purchaseType, artistId, includeIsHiddenFromDropList});

        this.sendResponse(res, data);
    }

    async show(req, res) {
        const contractAddress = req.params.contractAddress;

        let data = await CollectableRepository
                .setTransformer(CollectableOutputTransformer)
                .findBySlug(contractAddress);

        if (!data) {
             data = await CollectableRepository
                .setTransformer(CollectableOutputTransformer)
                .findByContractAddress(contractAddress);

        }

        if (!data) {
            data = await CollectableRepository
                .setTransformer(CollectableOutputTransformer)
                .findById(contractAddress);
        }

        this.sendResponse(res, data);
    }

    async map(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const {
            tokenIds,
        } = req.body;

        const data = await CollectableRepository
            .setTransformer(CollectableOutputTransformer)
            .queryByTokenIds(tokenIds.map(t => parseInt(t)));

        this.sendResponse(res, data);
    }

    async winner(req, res) {

        const contractAddress = req.params.contractAddress;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const {
            wallet_address,
            email,
            first_name,
            last_name,
            address,
            city,
            zip,
            province,
            country,
            telegram_username,
            phone,
            sig
        } = req.body;

        let collectable = await CollectableRepository.findByWinnerAddress(contractAddress, wallet_address)
        if (!collectable) {
            return this.sendResponse(res, {errors: errors.array()}, "Not found", 400);
        }

        const signAddress = wallet_address.toLowerCase();
        const msg = `I would like to save my shipping information for wallet address ${signAddress}.`;
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

        await CollectableWinnerRepository.create({
            wallet_address,
            email,
            first_name,
            last_name,
            address,
            city,
            zip,
            country,
            province,
            collectable_id: collectable.id,
            telegram_username,
            phone
        })

        this.sendResponse(res, []);
    }
}

module.exports = CollectableController;
