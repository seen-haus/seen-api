const BaseTransformer = require("../BaseTransformer");

class TicketCacheOutputTransformer extends BaseTransformer {
    transform(ticketCache) {
        let metadata = {};
        if(ticketCache && ticketCache.ticketData && ticketCache.ticketData.metadata) {
            metadata = JSON.parse(ticketCache.ticketData.metadata);
            if(ticketCache.ticketData.ticket_image_override) {
                metadata.image = ticketCache.ticketData.ticket_image_override;
            }
        }
        return {
            id: ticketCache.id,
            token_address: ticketCache.token_address,
            token_id: ticketCache.token_id,
            consignment_id: ticketCache.consignment_id,
            burnt_by_address: ticketCache.burnt_by_address,
            metadata: metadata,
        }
    }
}

module.exports = new TicketCacheOutputTransformer();
