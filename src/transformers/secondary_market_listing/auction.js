const BaseTransformer = require("./../BaseTransformer");
const DateHelper = require("./../../utils/DateHelper");

class SecondaryMarketListingAuctionTransformer extends BaseTransformer {
    transform(secondaryMarketListing) {

        return {
            id: secondaryMarketListing.id,
            collectable_id: secondaryMarketListing.collectable_id,
            slug: secondaryMarketListing.slug,
            purchase_type: secondaryMarketListing.purchase_type,
            edition: secondaryMarketListing.edition,
            edition_of: secondaryMarketListing.edition_of,
            contract_address: secondaryMarketListing.contract_address,
            is_active: secondaryMarketListing.is_active,
            is_sold_out: secondaryMarketListing.is_sold_out,
            created_at: secondaryMarketListing.created_at,
            updated_at: secondaryMarketListing.updated_at,
            starts_at: (new DateHelper).resolveDBTimestamp(secondaryMarketListing.starts_at),
            ends_at: secondaryMarketListing.ends_at ? (new DateHelper).resolveDBTimestamp(secondaryMarketListing.ends_at) : null,
            start_bid: secondaryMarketListing.min_bid,
            min_bid: secondaryMarketListing.min_bid,
            winner_address: secondaryMarketListing.winner_address,
            version: secondaryMarketListing.version,
            is_closed: secondaryMarketListing.is_closed,
            is_reserve_price_auction: !!secondaryMarketListing.is_reserve_price_auction,
            user_id: secondaryMarketListing.user_id,
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

module.exports = new SecondaryMarketListingAuctionTransformer();
