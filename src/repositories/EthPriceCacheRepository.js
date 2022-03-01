const { EthPriceCacheModel } = require("../models");
const BaseRepository = require("./BaseRepository");

class EthPriceCacheModelRepository extends BaseRepository {
    constructor(props) {
      super(props)
    }

    getModel() {
      return EthPriceCacheModel
    }
}

module.exports = new EthPriceCacheModelRepository()