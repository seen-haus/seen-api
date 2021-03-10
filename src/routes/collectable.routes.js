'use strict';

const Router = require("./Router");
Router.get('/collectables/', [], 'CollectableController@index');
Router.get('/collectables/:contractAddress', [], 'CollectableController@show');
Router.post('/collectables/:contractAddress/winner', [], 'CollectableController@submitWinner');

module.exports = Router.export();
