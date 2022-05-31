const { ConsignmentIdToTicketMetadataModel } = require("./../models");
const BaseRepository = require("./BaseRepository");

class ConsignmentIdToTicketMetadataRepository extends BaseRepository {
  constructor(props) {
      super(props)
  }

  getModel() {
      return ConsignmentIdToTicketMetadataModel
  }

}

module.exports = new ConsignmentIdToTicketMetadataRepository()
