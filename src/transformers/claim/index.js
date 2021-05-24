const BaseTransformer = require("./../BaseTransformer");

class ClaimTransformer extends BaseTransformer {
  transform(claim) {
    return {
      id: claim.id,
      collectable_id: claim.collectable_id,
      contract_address: claim.contract_address,
      title: claim.title,
      requires_message: claim.requires_message,
      message_helper: claim.message_helper,
    };
  }
}

module.exports = new ClaimTransformer();
