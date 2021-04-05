'use strict';

const Router = require("./Router");
/**
 * Artist
 */
Router.get('/artists/',[],'ArtistController@index');
Router.get('/artists/search', [], 'ArtistController@search');
Router.get('/artists/:slug', [], 'ArtistController@show');

module.exports = Router.export();
