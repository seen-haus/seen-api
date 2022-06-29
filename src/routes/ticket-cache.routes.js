'use strict';

const {body} = require('express-validator');

const Router = require("./Router");
/**
 * TokenCache
 */
Router.get(`/ticket/metadata/items-ticketer/:itemsTicketerTokenId`, [], 'TicketCacheController@ticketCacheGetTokenMetadata');

Router.post('/ticket-cache/ticket-sync-claimant-with-consignment-id', [
  body("token_address").notEmpty().isString(),
  body("claimant_address").notEmpty().isString(),
  body("consignment_id").notEmpty().isNumeric(),
], 'TicketCacheController@ticketCacheClaimantSyncByTokenAddressAndClaimant');

module.exports = Router.export();
