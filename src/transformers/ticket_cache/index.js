const BaseTransformer = require("../BaseTransformer");

class TicketCacheOutputTransformer extends BaseTransformer {
    transform(ticketCache) {
        return {
            token_address: ticketCache.token_address,
            token_id: ticketCache.token_id,
            consignment_id: ticketCache.consignment_id,
            burnt_by_address: ticketCache.burnt_by_address,
            metadata: JSON.parse(ticketCache.metadata),
        }
    }
}

module.exports = new TicketCacheOutputTransformer();
