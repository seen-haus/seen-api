'use strict';

const Router = require("./Router");
/**
 * TokenCache
 */
Router.get('/token-cache/',[],'TokenCacheController@index');
Router.get('/token-cache/:tokenAddress/:holderAddress',[],'TokenCacheController@tokenCacheByHolder');

module.exports = Router.export();
