const BaseTransformer = require("./../BaseTransformer");
const DateHelper = require("./../../utils/DateHelper");

class SecondaryMarketListingSaleTransformer extends BaseTransformer {
    transform(secondaryMarketListing) {
      return {
        id: secondaryMarketListing.id,
        collectable_id: secondaryMarketListing.collectable_id,
        slug: secondaryMarketListing.slug,
        purchase_type: secondaryMarketListing.purchase_type,
        available_qty: secondaryMarketListing.available_qty,
        edition: secondaryMarketListing.edition,
        edition_of: secondaryMarketListing.edition_of,
        contract_address: secondaryMarketListing.contract_address,
        is_active: secondaryMarketListing.is_active,
        is_sold_out: secondaryMarketListing.is_sold_out,
        created_at: secondaryMarketListing.created_at,
        updated_at: secondaryMarketListing.updated_at,
        starts_at: (new DateHelper).resolveDBTimestamp(secondaryMarketListing.starts_at),
        ends_at: secondaryMarketListing.ends_at ? (new DateHelper).resolveDBTimestamp(secondaryMarketListing.ends_at) : secondaryMarketListing.ends_at,
        price: secondaryMarketListing.price,
        version: secondaryMarketListing.version,
        is_closed: secondaryMarketListing.is_closed,
        user_id: secondaryMarketListing.user_id,
        consignment_id: secondaryMarketListing.consignment_id,
        market_type: secondaryMarketListing.market_type,
        market_handler_type: secondaryMarketListing.market_handler_type,
        state: secondaryMarketListing.state,
        outcome: secondaryMarketListing.outcome,
        multi_token: secondaryMarketListing.multi_token,
        released: secondaryMarketListing.released,
      }
    }
}

module.exports = new SecondaryMarketListingSaleTransformer();
