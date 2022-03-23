const { TokenCacheModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class TokenCacheRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return TokenCacheModel
    }

    async index() {
      const result = await this.model.query().where(function () {
        this.where('token_address');
      })

      return this.parserResult(result)
    }

    async findByTokenAddressAndId(tokenAddress, tokenId) {
      const result = await this.model.query().where(function () {
        this.where('token_address', tokenAddress);
        this.where('token_id', tokenId);
      })

      return this.parserResult(result)
    }

    async findOwnedTokens(tokenAddress, tokenHolder) {
      const result = await this.model.query().where(function () {
        this.where('token_address', tokenAddress);
        this.where('token_holder', tokenHolder);
      })

      return this.parserResult(result)
    }

    async patchHolderByTokenAddressAndId(holder, tokenAddress, tokenId) {
      await this.model.query().patch({token_holder: holder}).where(function () {
        this.where('token_address', tokenAddress);
        this.where('token_id', tokenId);
      })
    }
}

module.exports = new TokenCacheRepository()
