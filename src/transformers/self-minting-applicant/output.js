const BaseTransformer = require("./../BaseTransformer");

class SelfMintingApplicantOutputTransformer extends BaseTransformer {
    transform(selfMintingApplicant) {
      return {
        id: selfMintingApplicant.id,
        name: selfMintingApplicant.name,
        socials: typeof selfMintingApplicant.socials !== 'string' ? selfMintingApplicant.socials : JSON.parse(selfMintingApplicant.socials),
        ...(selfMintingApplicant.curation_round_overview && {
          curation_round_overview: {
            total_yes: selfMintingApplicant.curation_round_overview.total_yes ? selfMintingApplicant.curation_round_overview.total_yes : 0,
            total_no: selfMintingApplicant.curation_round_overview.total_no ? selfMintingApplicant.curation_round_overview.total_no : 0,
            total_effective: selfMintingApplicant.curation_round_overview.total_effective ? selfMintingApplicant.curation_round_overview.total_effective : 0,
          }
        })
        // Keep wallet address and email out of output
        // wallet_address: selfMintingApplicant.wallet_address,
        // email: selfMintingApplicant.email,    
      }
    }
}

module.exports = new SelfMintingApplicantOutputTransformer();
