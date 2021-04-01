'use strict';
const {body} = require('express-validator');
const Router = require("./Router");
Router.get('/collectables/', [], 'CollectableController@index');
Router.get('/collectables/:contractAddress', [], 'CollectableController@show');

Router.post('/collectables/:contractAddress/winner', [
    body("wallet_address").notEmpty().isEthereumAddress(),
    body("email").notEmpty().isEmail,
    body("first_name").notEmpty().isString(),
    body("last_name").notEmpty().isString(),
    body("address").notEmpty().isString(),
    body("city").notEmpty().isString(),
    body("zip").notEmpty(),
    body("country").notEmpty().isString(),
    body('sig').notEmpty(),
], 'CollectableController@submitWinner');

module.exports = Router.export();
