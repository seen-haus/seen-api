const { CurationRoundDeclarationsModel } = require("../models");
const BaseRepository = require("./BaseRepository");

class CurationRoundDeclarationRepository extends BaseRepository {
    constructor(props) {
      super(props)
    }

    getModel() {
      return CurationRoundDeclarationsModel
    }

    async getActiveRound(currentTimestamp, curationTopic) {
      const result = await this.model.query()
          .where('start_unix', '<=', currentTimestamp)
          .where('end_unix', '>=', currentTimestamp)
          .where('topic', curationTopic)
          .first();

      return this.parserResult(result);
    }

    async getCompletedRounds(currentTimestamp) {
      const result = await this.model.query()
      .where('end_unix', '<', currentTimestamp)
      if(!result) {
        return false;
      }
      return this.parserResult(result)
    }
}

module.exports = new CurationRoundDeclarationRepository()