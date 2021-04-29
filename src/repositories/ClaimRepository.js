const { ClaimModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class ClaimRepository extends BaseRepository {
  constructor(props) {
    super(props);
  }

  getModel() {
    return ClaimModel;
  }

  async findByContractAddress(contractAddress) {
    const result = await this.model
      .query()
      .withGraphJoined("collectable")
      .where("collectable.contract_address", "=", contractAddress)
      .where("claims.is_active", true)
      .first();
    if (!result) {
      return null;
    }
    return this.parserResult(result);
  }

  async findById(id) {
    const result = await this.model
      .query()
      .withGraphJoined("collectable")
      .where("claims.id", id)
      .where("claims.is_active", true)
      .first();

    if (!result) {
      return null;
    }

    return this.parserResult(result);
  }
}

module.exports = new ClaimRepository();
