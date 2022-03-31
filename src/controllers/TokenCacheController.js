const Controller = require('./Controller');
const {TokenCacheRepository} = require("../repositories");
const TokenCacheOutputTransformer = require("../transformers/token_cache/output");

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

}

module.exports = TokenCacheController;
