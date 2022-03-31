'use strict';

const Router = require("./Router");
/**
 * TokenCache
 */
Router.get('/token-cache/',[],'TokenCacheController@index');
Router.get('/token-cache/holder/:holderAddress',[],'TokenCacheController@tokenCacheByHolder');
Router.get('/token-cache/token/:tokenAddress',[],'TokenCacheController@tokenCacheByToken');
Router.get('/token-cache/:tokenAddress/:holderAddress',[],'TokenCacheController@tokenCacheByTokenAndHolder');

module.exports = Router.export();
