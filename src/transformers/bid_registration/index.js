const BaseTransformer = require("../BaseTransformer");

class BidRegistrationTransformer extends BaseTransformer {
  transform(bid_registration) {
    return {
      id: bid_registration.id,
      collectable_id: bid_registration.collectable_id,
      bidder_address: bid_registration.bidder_address,
      first_name: bid_registration.first_name,
      last_name: bid_registration.last_name,
      email: bid_registration.email,
      signed_message: bid_registration.signed_message,
      plaintext_message: bid_registration.plaintext_message,
      created_at: bid_registration.created_at,
      updated_at: bid_registration.updated_at,
    };
  }
}

module.exports = new BidRegistrationTransformer();
