const BaseTransformer = require("./../BaseTransformer");

class NFTTokenTransformer extends BaseTransformer {
    transform(token) {
        return {
            id: token.id,
            contract_address: token.contract_address,
            creator_address: token.creator_address,
            tx: token.tx,
            token_id: token.token_id,
            supply: token.supply,
            properties: typeof token.properties !== 'string' ? JSON.stringify(token.properties) : token.properties,
            royalties: typeof token.royalties !== 'string' ? JSON.stringify(token.royalties) : token.royalties,
            metadata: typeof token.metadata !== 'string' ? JSON.stringify(token.metadata) : token.metadata,
        }
    }
}

module.exports = new NFTTokenTransformer();
