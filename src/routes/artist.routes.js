'use strict';

const Router = require("./Router");
/**
 * Artist
 */
Router.get('/artists/',[],'ArtistController@index');
Router.get('/artists/search', [], 'ArtistController@search');
Router.get('/artists/:slug', [], 'ArtistController@show');
Router.post('/artists/self-create/requests', [], 'ArtistController@newRequest');

module.exports = Router.export();
