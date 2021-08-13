const Controller = require('./Controller');
const {UserRepository, UserEmailPreferencesRepository} = require("./../repositories");
const {UserOutputTransformer, UserTransformer, UserEmailPreferencesTransformer, UserEmailPreferencesOutputTransformer} = require("./../transformers");
const Web3Helper = require("./../utils/Web3Helper");
const ethers = require('ethers');
const {body, validationResult} = require('express-validator');
const CloudfrontHelper = require("./../utils/CloudfrontHelper");
const urlParse = require('url-parse');
const uploadHelper = require("./../utils/AvatarHelper");


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
            username: u.username,
            image: u.image
        }));

        this.sendResponse(res, arr);
    }

    async avatar(req, res) {
        let fnc = uploadHelper.array("files", 1)
        fnc(req, res, async (err) => {
                if (err) {
                    this.sendError(res, err, 400);
                    return;
                }
                let file = req.files[0];
                let url = CloudfrontHelper.replaceHost(file.location)
                this.sendResponse(res, {url})
            }
        )
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

        let {username, description, twitter, website, image, email} = payload;
        twitter = twitter ? twitter : null
        website = website ? website : null
        let socials = !twitter && !website ? null : {twitter, website}

        let data = {username, description, socials, image, email};
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

    async updateEmailAndPreferences(req, res) {
        const payload = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        // Validate signature
        let parsedMessage = false;
        let signer = false;
        if(req.body.msg && JSON.parse(req.body.msg) && req.body.signature) {
            parsedMessage = JSON.parse(req.body.msg);
            if(!parsedMessage['timestamp']) {
                this.sendError(res, 'Error: No signature timestamp provided', 400);
                return;
            }
            if(!parsedMessage['account']) {
                this.sendError(res, 'Error: No signature account provided', 400);
                return;
            }else{
                signer = parsedMessage['account'];
            }
            let currentTimestamp = Math.floor(new Date().getTime() / 1000);
            let secondsDifference = currentTimestamp - Number(parsedMessage['timestamp']);
            // Checks that signature is less than 10 minutes old
            if(secondsDifference < 600) {
                let reconstructedMessage = `{"reason":"Update SEEN.HAUS account email address & preferences","account":"${signer}","timestamp":${parsedMessage['timestamp']}}`;

                let isValidSignature = await Web3Helper.verifySignature(reconstructedMessage, req.body.signature, signer);
                if (!isValidSignature) {
                    this.sendError(res, 'Error: invalid signature message provided', 400);
                    return;
                }

                let user = await UserRepository
                    .setTransformer(UserOutputTransformer)
                    .findByAddress(signer);

                let {email, global_disable, outbid, claim_page_go_live} = payload;
                let data = {email, global_disable, outbid, claim_page_go_live};

                if (!user) {
                    data.wallet = signer;
                    user = await UserRepository
                        .create(UserTransformer.transform(data))
                } else {
                    user = await UserRepository
                        .update(UserTransformer.transform(data), user.id)
                }

                let preferences = await UserEmailPreferencesRepository
                    .setTransformer(UserEmailPreferencesOutputTransformer)
                    .findPreferencesByUserId(user.id);

                if (!preferences) {
                    preferences = await UserEmailPreferencesRepository
                        .create(UserEmailPreferencesOutputTransformer.transform(Object.assign(data, {user_id: user.id})))
                } else {
                    preferences = await UserEmailPreferencesRepository
                        .update(UserEmailPreferencesOutputTransformer.transform(Object.assign(data, {user_id: user.id})), preferences.id)
                }

                this.sendResponse(res, {
                    user: Object.assign(UserOutputTransformer.transform(user), {email: email}),
                    email_preferences: UserEmailPreferencesOutputTransformer.transform(preferences)
                });
            } else {
                this.sendError(res, 'Error: signature must be less than 10 minutes old', 400);
                return;
            }
        } else {
            this.sendError(res, 'Error: invalid signature message provided', 400);
            return;
        }
    }

    async getEmailAndPreferences(req, res) {
        const payload = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        // Validate signature
        let parsedMessage = false;
        let signer = false;
        if(req.body.msg && JSON.parse(req.body.msg) && req.body.signature) {
            parsedMessage = JSON.parse(req.body.msg);
            if(!parsedMessage['timestamp']) {
                this.sendError(res, 'Error: No signature timestamp provided', 400);
                return;
            }
            if(!parsedMessage['account']) {
                this.sendError(res, 'Error: No signature account provided', 400);
                return;
            }else{
                signer = parsedMessage['account'];
            }
            
            let currentTimestamp = Math.floor(new Date().getTime() / 1000);
            let secondsDifference = currentTimestamp - Number(parsedMessage['timestamp']);
            // Checks that signature is less than 10 minutes old
            if(secondsDifference < 600) {
                let reconstructedMessage = `{"reason":"Show SEEN.HAUS account email address and preferences","account":"${signer}","timestamp":${parsedMessage['timestamp']}}`;

                let isValidSignature = await Web3Helper.verifySignature(reconstructedMessage, req.body.signature, signer);
                if (!isValidSignature) {
                    this.sendError(res, 'Error: invalid signature message provided');
                    return;
                }

                let user = await UserRepository
                    .setTransformer(UserOutputTransformer)
                    .findByAddress(signer);

                let email = await UserRepository.findEmailByAddress(signer);

                let preferences = await UserEmailPreferencesRepository
                    .setTransformer(UserEmailPreferencesOutputTransformer)
                    .findPreferencesByUserId(user.id);

                this.sendResponse(res, {
                    user: Object.assign(UserOutputTransformer.transform(user), {email}),
                    email_preferences: UserEmailPreferencesOutputTransformer.transform(preferences)
                });
            } else {
                this.sendError(res, 'Error: signature must be less than 10 minutes old', 400);
                return;
            }
        } else {
            this.sendError(res, 'Error: invalid signature message provided', 400);
            return;
        }
    }

    async deleteEmail(req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        // Validate signature
        let parsedMessage = false;
        let signer = false;
        if(req.body.msg && JSON.parse(req.body.msg) && req.body.signature) {
            parsedMessage = JSON.parse(req.body.msg);
            if(!parsedMessage['timestamp']) {
                this.sendError(res, 'Error: No signature timestamp provided', 400);
                return;
            }
            if(!parsedMessage['account']) {
                this.sendError(res, 'Error: No signature account provided', 400);
                return;
            }else{
                signer = parsedMessage['account'];
            }
            
            let currentTimestamp = Math.floor(new Date().getTime() / 1000);
            let secondsDifference = currentTimestamp - Number(parsedMessage['timestamp']);
            // Checks that signature is less than 10 minutes old
            if(secondsDifference < 600) {
                let reconstructedMessage = `{"reason":"Delete SEEN.HAUS account email address","account":"${signer}","timestamp":${parsedMessage['timestamp']}}`;

                let isValidSignature = await Web3Helper.verifySignature(reconstructedMessage, req.body.signature, signer);
                if (!isValidSignature) {
                    this.sendError(res, 'Error: invalid signature message provided');
                    return;
                }

                // Check that user exists
                let user = await UserRepository.setTransformer(UserOutputTransformer).findByAddress(signer);
                
                if (!user) {
                    this.sendError(res, 'Error: user does not exist', 400);
                } else {
                    // Remove user's email address
                    user = await UserRepository
                        .update(UserTransformer.transform({email: null}), user.id)
                }

                this.sendResponse(res, {
                    user: Object.assign(UserOutputTransformer.transform(user)),
                });
            } else {
                this.sendError(res, 'Error: signature must be less than 10 minutes old', 400);
                return;
            }
        } else {
            this.sendError(res, 'Error: invalid signature message provided', 400);
            return;
        }
    }
}

module.exports = UserController;
