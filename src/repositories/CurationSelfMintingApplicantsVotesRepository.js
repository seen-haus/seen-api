const { CurationSelfMintingApplicantsVotesModel } = require("../models");
const BaseRepository = require("./BaseRepository");

class CurationSelfMintingApplicantsVotesRepository extends BaseRepository {
    constructor(props) {
      super(props)
    }

    getModel() {
      return CurationSelfMintingApplicantsVotesModel
    }

    async getExistingVoteByApplicantIdAndVoterAddress(applicantId, voterAddress, roundDeclarationId) {
        const result = await this.model.query()
            .where('sm_applicant_id', applicantId)
            .where('voter_address', voterAddress)
            .where('round_declaration_id', roundDeclarationId)
            .first();

        return this.parserResult(result);
    }
}

module.exports = new CurationSelfMintingApplicantsVotesRepository()