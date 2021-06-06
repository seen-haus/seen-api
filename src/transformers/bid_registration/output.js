const BaseTransformer = require("../BaseTransformer");

class BidRegistrationTransformer extends BaseTransformer {
  transform(bid_registration) {
    return {
      id: bid_registration.id,
      collectable_id: bid_registration.collectable_id,
      bidder_address: bid_registration.bidder_address,
    };
  }
}

module.exports = new BidRegistrationTransformer();
