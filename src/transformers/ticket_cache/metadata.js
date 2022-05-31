const BaseTransformer = require("../BaseTransformer");

class TicketCacheMetadataOutputTransformer extends BaseTransformer {
    transform(ticketCache) {
        let metadata = {};
        if(ticketCache && ticketCache.ticketData && ticketCache.ticketData.metadata) {
            metadata = JSON.parse(ticketCache.ticketData.metadata);
            if(ticketCache.ticketData.ticket_image_override) {
                metadata.image = ticketCache.ticketData.ticket_image_override;
            }
        }
        return metadata
    }
}

module.exports = new TicketCacheMetadataOutputTransformer();
