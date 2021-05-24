const BaseTransformer = require("./../BaseTransformer");
const CollectableOutputTransformer = require("../collectable/output");

class ClaimOutputTransformer extends BaseTransformer {
  transform(claim) {
    return {
      id: claim.id,
      collectable: claim.collectable
        ? CollectableOutputTransformer.transform(claim.collectable)
        : null,
      is_active: claim.is_active,
      contract_address: claim.contract_address,
      title: claim.title,
      requires_message: claim.requires_message,
      message_helper: claim.message_helper,
    };
  }
}

module.exports = new ClaimOutputTransformer();
