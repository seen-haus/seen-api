const BaseTransformer = require("./../BaseTransformer");
const CollectableOutputTransformer = require("../collectable/output")
const UserOutputTransformer = require("../user/output")

class SecondaryMarketListingOutputTransformer extends BaseTransformer {
  transform(secondaryMarketListing) {
    return {
      id: secondaryMarketListing.id,
      collectable: secondaryMarketListing.collectable
        ? CollectableOutputTransformer.transform(secondaryMarketListing.collectable)
        : null,
      events: secondaryMarketListing.events && secondaryMarketListing.events.length > 0
          ? secondaryMarketListing.events.map(event => {
              return event;
          })
          : [],
      purchase_type: secondaryMarketListing.purchase_type,
      type: secondaryMarketListing.type,
      contract_address: secondaryMarketListing.contract_address,
      is_sold_out: !!secondaryMarketListing.is_sold_out,
      slug: secondaryMarketListing.slug,
      starts_at: secondaryMarketListing.starts_at,
      ends_at: secondaryMarketListing.ends_at,
      available_qty: secondaryMarketListing.available_qty,
      edition: secondaryMarketListing.edition,
      edition_of: secondaryMarketListing.edition_of,
      is_active: !!secondaryMarketListing.is_active,
      start_bid: secondaryMarketListing.start_bid,
      min_bid: secondaryMarketListing.min_bid,
      version: secondaryMarketListing.version,
      winner_address: secondaryMarketListing.winner_address,
      price: secondaryMarketListing.price,
      created_at: secondaryMarketListing.created_at,
      updated_at: secondaryMarketListing.updated_at,
      is_closed: !!secondaryMarketListing.is_closed,
      is_reserve_price_auction: !!secondaryMarketListing.is_reserve_price_auction,
      user: secondaryMarketListing.user ? UserOutputTransformer.transform(secondaryMarketListing.user) : null,
      consignment_id: secondaryMarketListing.consignment_id,
      market_type: secondaryMarketListing.market_type,
      market_handler_type: secondaryMarketListing.market_handler_type,
      clock_type: secondaryMarketListing.clock_type,
      state: secondaryMarketListing.state,
      outcome: secondaryMarketListing.outcome,
      multi_token: secondaryMarketListing.multi_token,
      released: secondaryMarketListing.released,
    }
  }
}

module.exports = new SecondaryMarketListingOutputTransformer();
