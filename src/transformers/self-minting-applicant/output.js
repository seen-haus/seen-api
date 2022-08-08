const BaseTransformer = require("./../BaseTransformer");

class SelfMintingApplicantOutputTransformer extends BaseTransformer {
    transform(selfMintingApplicant) {
      return {
        id: selfMintingApplicant.id,
        name: selfMintingApplicant.name,
        socials: typeof selfMintingApplicant.socials !== 'string' ? selfMintingApplicant.socials : JSON.parse(selfMintingApplicant.socials),
        // Keep wallet address and email out of output
        // wallet_address: selfMintingApplicant.wallet_address,
        // email: selfMintingApplicant.email,    
      }
    }
}

module.exports = new SelfMintingApplicantOutputTransformer();
