const Controller = require('./Controller');
const SelfMintingApplicantOutputTransformer = require("../transformers/self-minting-applicant/output");
const SelfMintingInternalAccessRequestsRepository = require('../repositories/SelfMintingInternalAccessRequestsRepository');

class CurationController extends Controller {

    async candidates(req, res) {

      const candidateType = req.query.candidateType;

      const pagination = this.extractPagination(req);

      let candidateData;

      if(candidateType == 'selfCreation') {
        candidateData = await SelfMintingInternalAccessRequestsRepository
          .setTransformer(SelfMintingApplicantOutputTransformer)
          .paginate(pagination.perPage, pagination.page);
      }

      console.log({candidateData})

      this.sendResponse(res, candidateData);
    }
    
}

module.exports = CurationController;
