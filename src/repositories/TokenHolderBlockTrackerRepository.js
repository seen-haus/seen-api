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

  async getAndLockActiveUnlocked() {
    const result = await this.model.query().where('enable_tracking', true).where('is_busy_lock', false);
    for(let record of result) {
      await this.model.query().patch({is_busy_lock: true}).where(function () {
        this.where('id', record.id);
      })
    }
    return this.parserResult(result)
  }

  async getActiveTrackers() {
    const result = await this.model.query().where('enable_tracking', true);
    return this.parserResult(result)
  }

  async getTrackerByTokenAddress(tokenAddress) {
    const result = await this.model.query().where('token_address', tokenAddress).first();;
    return this.parserResult(result);
  }

  async getTicketTrackerByTokenAddress(tokenAddress) {
    const result = await this.model.query().where('token_address', tokenAddress).where('is_ticketer', true).first();;
    return this.parserResult(result);
  }

  async lockTrackerByTokenAddress(tokenAddress) {
    await this.model.query().patch({is_busy_lock: true}).where(function () {
      this.where('token_address', tokenAddress);
    })
  }

  async unlockTrackerByTokenAddress(tokenAddress) {
    await this.model.query().patch({is_busy_lock: false}).where(function () {
      this.where('token_address', tokenAddress);
    })
  }

  async updateBlockNumberByTokenAddress(tokenAddress, blockNumber) {
    await this.model.query().patch({latest_checked_block: blockNumber}).where(function () {
      this.where('token_address', tokenAddress);
    })
  }
}

module.exports = new TokenHolderBlockTrackerRepository()
