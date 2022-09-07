const { SnapshotDeclarationsModel } = require("../models");
const BaseRepository = require("./BaseRepository");

class SnapshotDeclarationRepository extends BaseRepository {
  constructor(props) {
      super(props)
  }

  getModel() {
      return SnapshotDeclarationsModel
  }

  async getActiveSnapshots() {
    const result = await this.model.query().where('enabled', true).withGraphFetched('[token_data]');
    return this.parserResult(result)
  }

  async getSnapshotDeclarationByTokenAddress(tokenAddress) {
    const result = await this.model.query().where('token_address', tokenAddress);
    return this.parserResult(result)
  }

  async lockSnapshotByTokenAddress(tokenAddress) {
    await this.model.query().patch({is_busy_lock: true}).where(function () {
      this.where('token_address', tokenAddress);
    })
  }

  async unlockSnapshotByTokenAddress(tokenAddress) {
    await this.model.query().patch({is_busy_lock: false}).where(function () {
      this.where('token_address', tokenAddress);
    })
  }

  async updateFirstSnapshotInfo(tokenAddress, blockNumber, actualUnix) {
    await this.model.query().patch({
      first_snapshot_block: blockNumber,
      first_snapshot_actual_unix: actualUnix
    }).where(function () {
      this.where('token_address', tokenAddress);
    })
  }

  async updateLastSnapshotInfo(tokenAddress, targetUnix, blockNumber, actualUnix) {
    await this.model.query().patch({
      last_snapshot_target_unix: targetUnix,
      last_snapshot_block: blockNumber,
      last_snapshot_actual_unix: actualUnix,
    }).where(function () {
      this.where('token_address', tokenAddress);
    })
  }

}

module.exports = new SnapshotDeclarationRepository()
