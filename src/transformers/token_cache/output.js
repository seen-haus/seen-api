const BaseTransformer = require("../BaseTransformer");

class TokenCacheOutputTransformer extends BaseTransformer {
    transform(tokenCache) {
        let metadata = {};
        if(tokenCache.ticketData && tokenCache.ticketData.metadata) {
            metadata = JSON.parse(tokenCache.ticketData.metadata);
            if(tokenCache.ticketData.ticket_image_override) {
                metadata.image = tokenCache.ticketData.ticket_image_override;
            }
        }
        return {
            token_address: tokenCache.token_address,
            token_id: tokenCache.token_id,
            token_balance: tokenCache.token_balance,
            token_holder: tokenCache.token_holder,
            consignment_id: tokenCache.consignment_id,
            metadata: metadata,
        }
    }
}

module.exports = new TokenCacheOutputTransformer();
