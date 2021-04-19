const BaseTransformer = require("./../BaseTransformer");
const DateHelper = require("./../../utils/DateHelper");

class CollectableSaleTransformer extends BaseTransformer {
    transform(collectable) {
        return {
            id: collectable.id,
            title: collectable.title,
            slug: collectable.slug,
            medium: collectable.medium,
            type: collectable.type,
            purchase_type: collectable.purchase_type,
            category: collectable.category,
            artist_id: collectable.artist_id,
            description: collectable.description,
            available_qty: collectable.available_qty,
            edition: collectable.edition,
            edition_of: collectable.edition_of,
            contract_address: collectable.contract_address,
            is_active: collectable.is_active,
            is_sold_out: collectable.is_sold_out,
            created_at: collectable.created_at,
            updated_at: collectable.updated_at,
            starts_at: (new DateHelper).resolveDBTimestamp(collectable.starts_at),
            ends_at: collectable.ends_at ? (new DateHelper).resolveDBTimestamp(collectable.ends_at) : collectable.ends_at,
            price: collectable.price,
            artist_statement: collectable.artist_statement,
            version: collectable.version,
            is_coming_soon: collectable.is_coming_soon,
            shipping_location: collectable.shipping_location,
            nft_contract_address: collectable.nft_contract_address,
            nft_ipfs_hash: collectable.nft_ipfs_hash,
            nft_token_id: collectable.nft_token_id,
        }
    }
}

module.exports = new CollectableSaleTransformer();
