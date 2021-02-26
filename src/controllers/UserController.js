const Controller = require('./Controller');
const {UserRepository} = require("./../repositories");
const Web3Helper = require("./../utils/Web3Helper");

class UserController extends Controller {
    async create(req, res) {
        const payload = req.body;
        let walletAddress = payload.wallet_address;

        if (!req.params.sig || !payload.username) {
            this.sendResponse(res, null);
            return;
        }
        const msg = `I would like to update my account preferences for ${walletAddress}.`
        let isValidSignature = await Web3Helper.verifySignature(msg, req.params.sig, walletAddress);
        if (!isValidSignature) {
            this.sendResponse(res, null);
            return;
        }
        let user = await UserRepository.findByAddress(walletAddress);
        if (user) {
            let data = {username: payload.username}
            user = await UserRepository
                .update(data, user.id)
        } else {
            let data = {username: payload.username, wallet: walletAddress}
            user = await UserRepository
                .create(data)
        }
        this.sendResponse(res, {user});
    }

    async show(req, res) {
        const walletAddress = req.params.walletAddress;
        if (!walletAddress) {
            this.sendResponse(res, null);
            return
        }
        let user = await UserRepository.findByAddress(walletAddress);
        this.sendResponse(res, {user});
    }

    async update(req, res) {
        const payload = req.body;
        const walletAddress = payload.walletAddress;
        const username = payload.username;
        const sig = payload.sig;
        const msg = `I would like to update my account preferences for ${walletAddress}.`
        if (!sig || !username || !walletAddress) {
            this.sendResponse(res, null);
            return;
        }
        if (username.length < 3 || username.length > 15) {
            this.sendResponse(res, null);
            return;
        }

        let isValidSignature = await Web3Helper.verifySignature(msg, sig, walletAddress);
        if (!isValidSignature) {
            this.sendResponse(res, null);
            return;
        }
        let user = await UserRepository.findByAddress(walletAddress);
        if (!user) {
            let data = {username: payload.username, wallet: walletAddress}
            user = await UserRepository
                .create(data)
        } else {
            let data = {username}
            user = await UserRepository
                .update(data, user.id)
        }

        this.sendResponse(res, {user});
    }
}

module.exports = UserController;
