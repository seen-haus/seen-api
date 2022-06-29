'use strict';

const {body} = require('express-validator');

const Router = require("./Router");
/**
 * TokenCache
 */
Router.get('/token-cache/',[],'TokenCacheController@index');
Router.get('/token-cache/holder/:holderAddress',[],'TokenCacheController@tokenCacheByHolder');
Router.get('/token-cache/token/:tokenAddress',[],'TokenCacheController@tokenCacheByToken');
Router.get('/token-cache/:tokenAddress/:holderAddress',[],'TokenCacheController@tokenCacheByTokenAndHolder');
Router.post('/token-cache/ticket-sync-with-consignment-id', [
  body("token_address").notEmpty().isString(),
  body("holder_or_claimant_address").notEmpty().isString(),
  body("consignment_id").notEmpty().isNumeric(),
], 'TokenCacheController@tokenCacheTicketSyncByTokenAndHolder');

module.exports = Router.export();
