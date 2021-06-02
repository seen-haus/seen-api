const BaseTransformer = require("./../BaseTransformer");
const ArtistOutputTransformer = require("../artist/output")
const MediaOutputTransformer = require("../media/output")

class CollectableOutputTransformer extends BaseTransformer {
    transform(collectable) {
        return {
            id: collectable.id,
            artist: collectable.artist ? ArtistOutputTransformer.transform(collectable.artist) : null,
            media: collectable.media && collectable.media.length > 0
                ? collectable.media.map(media => MediaOutputTransformer.transform(media))
                : [],
            events: collectable.events && collectable.events.length > 0
                ? collectable.events.map(event => {
                    return event;
                })
                : [],
            bundleChildItems: collectable.bundleChildItems && collectable.bundleChildItems.length > 0
                ? collectable.bundleChildItems.map(bundleChildItem => {
                    return bundleChildItem;
                })
                : [],
            claim: collectable.claim ? collectable.claim : null,
            purchase_type: collectable.purchase_type,
            type: collectable.type,
            contract_address: collectable.contract_address,
            is_sold_out: !!collectable.is_sold_out,
            slug: collectable.slug,
            artist_statement: collectable.artist_statement,
            starts_at: collectable.starts_at,
            ends_at: collectable.ends_at,
            available_qty: collectable.available_qty,
            title: collectable.title,
            medium: collectable.medium,
            edition: collectable.edition,
            edition_of: collectable.edition_of,
            description: collectable.description,
            is_active: !!collectable.is_active,
            is_hidden_from_drop_list: !!collectable.is_hidden_from_drop_list,
            is_slug_full_route: !!collectable.is_slug_full_route,
            start_bid: collectable.start_bid,
            min_bid: collectable.min_bid,
            version: collectable.version,
            winner_address: collectable.winner_address,
            price: collectable.price,
            category: collectable.category,
            is_coming_soon: !!collectable.is_coming_soon,
            shipping_location: collectable.shipping_location,
            nft_contract_address: collectable.nft_contract_address,
            nft_ipfs_hash: collectable.nft_ipfs_hash,
            nft_token_id: collectable.nft_token_id,
            created_at: collectable.created_at,
            updated_at: collectable.updated_at,
            is_closed: !!collectable.is_closed,
            pill_override: collectable.pill_override,
        }
    }
}

module.exports = new CollectableOutputTransformer();
