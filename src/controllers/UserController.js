const Controller = require('./Controller');
const {UserRepository} = require("./../repositories");
const {UserOutputTransformer, UserTransformer} = require("./../transformers");
const Web3Helper = require("./../utils/Web3Helper");
const ethers = require('ethers');
const {body, validationResult} = require('express-validator');

class UserController extends Controller {

    async show(req, res) {
        const walletAddress = req.params.walletAddress;
        if (!walletAddress || (walletAddress && !ethers.utils.isAddress(walletAddress))) {
            return this.sendResponse(res, null);
        }
        let user = await UserRepository.findByAddress(walletAddress);
        if (!user) {
            return this.sendResponse(res, null);
        }
        this.sendResponse(res, {user: UserOutputTransformer.transform(user)});
    }

    async resolveUsername(req, res) {
        const walletAddress = req.params.walletAddress;
        if (!walletAddress || (walletAddress && !ethers.utils.isAddress(walletAddress))) {
            return this.sendResponse(res, null);
        }
        let user = await UserRepository.findByAddress(walletAddress);
        if (!user) {
            return this.sendResponse(res, null);
        }
        this.sendResponse(res, {username: user.username});
    }

    async resolveUsernames(req, res) {
        const payload = req.body;
        const walletAddresses = payload.walletAddresses;
        if (!walletAddresses || walletAddresses.length === 0) {
            return this.sendResponse(res, []);
        }

        let users = await UserRepository.query()
            .whereIn('wallet', walletAddresses);

        if (users.length == 0) {
            return this.sendResponse(res, []);
        }

        let arr = users.map(u => ({
            walletAddress: u.wallet,
            username: u.username
        }));

        this.sendResponse(res, arr);
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
        twitter = twitter ? twitter : null
        website = website ? website : null
        let socials = !twitter && !website ? null : {twitter, website}

        let data = {username, description, socials};
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
