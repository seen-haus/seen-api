const BaseTransformer = require("./../BaseTransformer");

class ClaimOutputTransformer extends BaseTransformer {
    transform(eligible_claimant) {
        return {
            id: eligible_claimant.id,
            claim_id: eligible_claimant.claim_id,
            wallet_address: eligible_claimant.wallet_address,
            created_at: eligible_claimant.created_at,
            updated_at: eligible_claimant.updated_at,
        };
    }
}

module.exports = new ClaimOutputTransformer();
