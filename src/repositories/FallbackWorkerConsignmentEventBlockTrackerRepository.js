const { FallbackWorkerConsignmentEventBlockTrackerModel } = require("../models");
const BaseRepository = require("./BaseRepository");

class FallbackWorkerConsignmentEventBlockTrackerRepository extends BaseRepository {
    constructor(props) {
      super(props)
    }

    getModel() {
      return FallbackWorkerConsignmentEventBlockTrackerModel
    }
}

module.exports = new FallbackWorkerConsignmentEventBlockTrackerRepository()