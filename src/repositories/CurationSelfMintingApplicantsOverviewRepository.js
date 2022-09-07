const { CurationSelfMintingApplicantsOverviewModel } = require("../models");
const BaseRepository = require("./BaseRepository");

class CurationSelfMintingApplicantsOverviewRepository extends BaseRepository {
    constructor(props) {
      super(props)
    }

    getModel() {
      return CurationSelfMintingApplicantsOverviewModel
    }

    async getCurrentVoteReceiverOverview(applicantId, roundDeclarationId) {

      const result = await this.model.query()
          .where('sm_applicant_id', applicantId)
          .where('round_declaration_id', roundDeclarationId)
          .first();

      if (!result) {
        return null;
      }

      return this.parserResult(result);
    }
}

module.exports = new CurationSelfMintingApplicantsOverviewRepository()