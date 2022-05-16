const BaseTransformer = require("../BaseTransformer");

class TokenCacheOutputTransformer extends BaseTransformer {
    transform(tokenCache) {
        return {
            token_address: tokenCache.token_address,
            token_id: tokenCache.token_id,
            token_balance: tokenCache.token_balance,
            token_holder: tokenCache.token_holder,
            consignment_id: tokenCache.consignment_id,
            metadata: JSON.parse(tokenCache.metadata),
        }
    }
}

module.exports = new TokenCacheOutputTransformer();
