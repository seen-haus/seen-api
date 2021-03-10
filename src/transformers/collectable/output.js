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
            purchase_type: collectable.purchase_type,
            type: collectable.type,
            contract_address: collectable.contract_address,
            is_sold_out: collectable.is_sold_out,
            slug: collectable.slug,
            artist_statement: collectable.artist_statement,
            starts_at: collectable.starts_at,
            ends_at: collectable.ends_at,
            available_qty: collectable.available_qty,
            title: collectable.title,
            type_description: collectable.type_description,
            edition: collectable.edition,
            edition_of: collectable.edition_of,
            description: collectable.description,
            is_active: collectable.is_active,
            start_bid: collectable.start_bid,
            min_bid: collectable.min_bid,
            version: collectable.version,
            winner_address: collectable.winner_address,
            price: collectable.price,
            category: collectable.category,
            is_coming_soon: collectable.is_coming_soon,
            shipping_location: collectable.shipping_location,
            nft_contract_address: collectable.nft_contract_address,
            nft_ipfs_hash: collectable.nft_ipfs_hash,
            nft_token_id: collectable.nft_token_id,
            created_at: collectable.created_at,
            updated_at: collectable.updated_at,
        }
    }
}

module.exports = new CollectableOutputTransformer();
