const { SnapshotTrackerModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class SnapshotTrackerRepository extends BaseRepository {
  constructor(props) {
      super(props)
  }

  getModel() {
      return SnapshotTrackerModel
  }
}

module.exports = new SnapshotTrackerRepository()
