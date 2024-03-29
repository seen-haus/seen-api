const { validationResult } = require("express-validator");

const Controller = require('./Controller');
const {
    TokenCacheRepository,
    TicketCacheRepository,
    TokenHolderBlockTrackerRepository,
} = require("../repositories");
const {
    handleCheckpointSyncERC1155,
} = require("../workers/helpers/TokenHolderCheckpointSyncHelpers");
const TokenCacheOutputTransformer = require("../transformers/token_cache/output");
const TicketCacheOutputTransformer = require("../transformers/ticket_cache/output");

class TokenCacheController extends Controller {

    async index(req, res) {
        const pagination = this.extractPagination(req)
        const data = await TokenCacheRepository.setTransformer(TokenCacheOutputTransformer).all();

        this.sendResponse(res, data);
    }

    async tokenCacheByTokenAndHolder(req, res) {
        const tokenAddress = req.params.tokenAddress;
        const holderAddress = req.params.holderAddress;

        const data = await TokenCacheRepository.setTransformer(TokenCacheOutputTransformer).findOwnedTokens(tokenAddress, holderAddress);

        this.sendResponse(res, data);
    }

    async tokenCacheByHolder(req, res) {
        const holderAddress = req.params.holderAddress;

        const data = await TokenCacheRepository.setTransformer(TokenCacheOutputTransformer).findOwnedTokens(false, holderAddress);

        this.sendResponse(res, data);
    }

    async tokenCacheByToken(req, res) {
        const tokenAddress = req.params.tokenAddress;

        const data = await TokenCacheRepository.setTransformer(TokenCacheOutputTransformer).findOwnedTokens(tokenAddress, false);

        this.sendResponse(res, data);
    }

    async tokenCacheTicketSyncByTokenAndHolder(req, res) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return this.sendResponse(
                res,
                { errors: errors.array() },
                "Validation error",
                422
            );
        }

        const {
            token_address,
            holder_or_claimant_address,
            consignment_id
        } = req.body;

        let trackerRecord = await TokenHolderBlockTrackerRepository.getTicketTrackerByTokenAddress(token_address);

        let data = {};

        if(trackerRecord && trackerRecord.token_address) {
            if (trackerRecord.token_standard === 'ERC1155') {
                await handleCheckpointSyncERC1155(trackerRecord);
            }
            let dataHolder = await TokenCacheRepository.setTransformer(TokenCacheOutputTransformer).findOwnedTokensWithConsignmentId(token_address, holder_or_claimant_address, consignment_id);
            data.holder = dataHolder;
            
            let dataClaimant = await TicketCacheRepository.setTransformer(TicketCacheOutputTransformer).findBurntTicketTokensWithConsignmentId(token_address, holder_or_claimant_address, consignment_id);
            data.claimant = dataClaimant;
        }

        this.sendResponse(res, data);

    }

}

module.exports = TokenCacheController;
