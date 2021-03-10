'use strict';

const Router = require("./Router");
/**
 * Artist
 */
Router.get('/artists/',[],'ArtistController@index')

module.exports = Router.export();
