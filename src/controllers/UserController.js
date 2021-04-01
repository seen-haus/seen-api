const Controller = require('./Controller');
const {UserRepository} = require("./../repositories");
const {UserOutputTransformer, UserTransformer} = require("./../transformers");
const Web3Helper = require("./../utils/Web3Helper");
const ethers = require('ethers');
const {body, validationResult} = require('express-validator');

class UserController extends Controller {
    // async create(req, res) {
    //     const payload = req.body;
    //     let walletAddress = payload.wallet_address;
    //
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //         return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
    //     }
    //
    //     const msg = `I would like to update my account preferences for ${walletAddress}.`
    //     let isValidSignature = await Web3Helper.verifySignature(msg, req.params.sig, walletAddress);
    //     if (!isValidSignature) {
    //         this.sendResponse(res, null);
    //         return;
    //     }
    //     let user = await UserRepository.findByAddress(walletAddress);
    //     if (user) {
    //         let data = {username: payload.username}
    //         user = await UserRepository
    //             .update(data, user.id)
    //     } else {
    //         let data = {username: payload.username, wallet: walletAddress}
    //         user = await UserRepository
    //             .create(data)
    //     }
    //     this.sendResponse(res, {user});
    // }

    async show(req, res) {
        const walletAddress = req.params.walletAddress;
        if (!walletAddress || (walletAddress && !ethers.utils.isAddress(walletAddress))) {
            return this.sendResponse(res, null);
        }
        let user = await UserRepository.findByAddress(walletAddress);
        this.sendResponse(res, {user: UserOutputTransformer.transform(user)});
    }

    async update(req, res) {
        const payload = req.body;
        const walletAddress = payload.walletAddress
            ? payload.walletAddress
            : req.params.walletAddress;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const sig = payload.sig;
        const msg = `I would like to update my account preferences for ${walletAddress}.`

        let isValidSignature = await Web3Helper.verifySignature(msg, sig, walletAddress);
        if (!isValidSignature) {
            this.sendResponse(res, null);
            return;
        }

        let user = await UserRepository
            .setTransformer(UserOutputTransformer)
            .findByAddress(walletAddress);

        let {username, description, twitter, website} = payload;
        twitter = twitter ? twitter : (user && user.socials ? user.socials.twitter : null)
        website = website ? website : (user && user.socials ? user.socials.website : null)
        let data = {username, description, socials: {twitter, website}};
        if (!user) {
            data.wallet = walletAddress;
            user = await UserRepository
                .create(UserTransformer.transform(data))
        } else {
            user = await UserRepository
                .update(UserTransformer.transform(data), user.id)
        }

        this.sendResponse(res, {user: UserOutputTransformer.transform(user)});
    }
}

module.exports = UserController;
