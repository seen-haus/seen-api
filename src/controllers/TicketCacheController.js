const { validationResult } = require("express-validator");

const Controller = require('./Controller');
const {
    TicketCacheRepository,
    TokenHolderBlockTrackerRepository,
} = require("../repositories");
const {
    handleCheckpointSyncERC1155,
} = require("../workers/helpers/TokenHolderCheckpointSyncHelpers");
const TicketCacheOutputTransformer = require("../transformers/ticket_cache/output");
const TicketCacheMetadataOutputTransformer = require("../transformers/ticket_cache/metadata");

class TicketCacheController extends Controller {

    async index(req, res) {
        const pagination = this.extractPagination(req)
        const data = await TicketCacheRepository.setTransformer(TicketCacheOutputTransformer).all();

        this.sendResponse(res, data);
    }

    async tokenCacheByTokenAndHolder(req, res) {
        const tokenAddress = req.params.tokenAddress;
        const holderAddress = req.params.holderAddress;

        const data = await TicketCacheRepository.setTransformer(TicketCacheOutputTransformer).findOwnedTokens(tokenAddress, holderAddress);

        this.sendResponse(res, data);
    }

    async tokenCacheByHolder(req, res) {
        const holderAddress = req.params.holderAddress;

        const data = await TicketCacheRepository.setTransformer(TicketCacheOutputTransformer).findOwnedTokens(false, holderAddress);

        this.sendResponse(res, data);
    }

    async ticketCacheByToken(req, res) {
        const tokenAddress = req.params.tokenAddress;

        const data = await TicketCacheRepository.setTransformer(TicketCacheOutputTransformer).findOwnedTokens(tokenAddress, false);

        this.sendResponse(res, data);
    }

    async ticketCacheClaimantSyncByTokenAddressAndClaimant(req, res) {

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
            claimant_address,
            consignment_id
        } = req.body;

        let trackerRecord = await TokenHolderBlockTrackerRepository.getTicketTrackerByTokenAddress(token_address);

        let data = [];

        if(trackerRecord && trackerRecord.token_address) {
            if (trackerRecord.token_standard === 'ERC1155') {
                await handleCheckpointSyncERC1155(trackerRecord);
            }
            data = await TicketCacheRepository.setTransformer(TicketCacheOutputTransformer).findBurntTicketTokensWithConsignmentId(token_address, claimant_address, consignment_id);
        }

        this.sendResponse(res, data);

    }

    async ticketCacheGetTokenMetadata(req, res) {

      const itemsTicketerTokenId = req.params.itemsTicketerTokenId;

      const data = await TicketCacheRepository.setTransformer(TicketCacheMetadataOutputTransformer).findTicketMetadata(itemsTicketerTokenId);

      this.sendRawResponse(res, data);

    }

}

module.exports = TicketCacheController;
