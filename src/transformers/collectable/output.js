const BaseTransformer = require("./../BaseTransformer");
const ArtistOutputTransformer = require("../artist/output")
const NFTTokenOutputTransformer = require("../nft_token/output")

class CollectableOutputTransformer extends BaseTransformer {
    transform(collectable) {
        return {
            id: collectable.id,
            artist: collectable.artist ? ArtistOutputTransformer.transform(collectable.artist) : null,
            nft_token: collectable.nft_token ? NFTTokenOutputTransformer.transform(collectable.nft_token) : null,
            purchase_type: collectable.purchase_type,
            type: collectable.type,
            media: typeof collectable.media === 'string' ? JSON.parse(collectable.media) : collectable.media,
            contract_address: collectable.contract_address,
            created_at: collectable.created_at,
            updated_at: collectable.updated_at,
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
            category: collectable.category
        }
    }
}

module.exports = new CollectableOutputTransformer();
