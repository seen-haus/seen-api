const { TokenHolderBlockTrackerModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class TokenHolderBlockTrackerRepository extends BaseRepository {
  constructor(props) {
      super(props)
  }

  getModel() {
      return TokenHolderBlockTrackerModel
  }

  async active() {
    const result = await this.model.query().where('enable_tracking', true);
    return this.parserResult(result)
  }

  async updateBlockNumberByTokenAddress(tokenAddress, blockNumber) {
    await this.model.query().patch({latest_checked_block: blockNumber}).where(function () {
      this.where('token_address', tokenAddress);
    })
  }
}

module.exports = new TokenHolderBlockTrackerRepository()
