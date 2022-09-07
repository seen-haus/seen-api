const { SnapshotCacheModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class SnapshotCacheRepository extends BaseRepository {
  constructor(props) {
      super(props)
  }

  getModel() {
      return SnapshotCacheModel
  }

  async clearSnapshotCacheByTokenAddress(tokenAddress) {
    const rowsDeleted = await this.model.query().delete().where(function () {
      this.where('token_address', tokenAddress);
    })
    return rowsDeleted;
  }
}

module.exports = new SnapshotCacheRepository()
