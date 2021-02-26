'use strict';

const Router = require("./Router");
Router.get('/users/:walletAddress', [], 'UserController@show');
Router.post('/users/', [], 'UserController@create');
Router.put('/users/:walletAddress', [], 'UserController@update');

module.exports = Router.export();
