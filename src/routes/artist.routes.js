'use strict';

const Router = require("./Router");
/**
 * Artist
 */
Router.get('/artists/',[],'ArtistController@index')
Router.get('/artists/:id', [], 'ArtistController@show');

module.exports = Router.export();
