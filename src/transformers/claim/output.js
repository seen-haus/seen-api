const BaseTransformer = require("./../BaseTransformer");
const CollectableOutputTransformer = require("../collectable/output")

class ClaimOutputTransformer extends BaseTransformer {
    transform(claim) {
        return {
            id: claim.id,
            collectable: claim.collectable ? CollectableOutputTransformer.transform(claim.collectable) : null,
            contract_address: claim.contract_address
        }
    }
}

module.exports = new ClaimOutputTransformer();
