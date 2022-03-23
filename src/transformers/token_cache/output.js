const BaseTransformer = require("../BaseTransformer");

class TokenCacheOutputTransformer extends BaseTransformer {
    transform(tokenCache) {
        return {
            token_address: tokenCache.token_address,
            token_id: tokenCache.token_id,
            token_holder: tokenCache.token_holder,
            metadata: JSON.parse(tokenCache.metadata),
        }
    }
}

module.exports = new TokenCacheOutputTransformer();