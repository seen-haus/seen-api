const BaseTransformer = require("./../BaseTransformer");

class CollectableTransformer extends BaseTransformer {
    transform(collectable) {
        return {
            id: collectable.id,
            title: collectable.title,
            slug: collectable.slug,
            type_description: collectable.type_description,
            type: collectable.type,
            purchase_type: collectable.purchase_type,
            category: collectable.category,
            artist_id: collectable.artist_id,
            token_id: collectable.token_id,
            description: collectable.description,
            available_qty: collectable.available_qty,
            edition: collectable.edition,
            edition_of: collectable.edition_of,
            contract_address: collectable.contract_address,
            is_active: collectable.is_active,
            is_sold_out: collectable.is_sold_out,
            created_at: collectable.created_at,
            updated_at: collectable.updated_at,
            starts_at: collectable.starts_at,
            ends_at: collectable.ends_at,
            start_bid: collectable.start_bid,
            min_bid: collectable.min_bid,
            price: collectable.price,
            media: typeof collectable.media === 'string' ? collectable.media : JSON.stringify(collectable.media),
            artist_statement: collectable.artist_statement,
            winner_address: collectable.winner_address,
            version: collectable.version,
        }
    }
}

module.exports = new CollectableTransformer();
