'use strict';

const Router = require("./Router");
Router.post('/collectables/:contractAddress/winner', [], 'CollectableController@submitWinner');

module.exports = Router.export();
