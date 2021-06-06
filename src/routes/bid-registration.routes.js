'use strict';
const {body} = require('express-validator');
const Router = require("./Router");

Router.get('/bid-registration-status/:walletAddress/:collectableId', [], 'BidRegistrationController@isRegistered');

Router.post('/bid-registration', [
    body("wallet_address").notEmpty().isEthereumAddress(),
    body("first_name").notEmpty().isString(),
    body("last_name").notEmpty().isString(),
    body("email").notEmpty().isEmail(),
    body("collectable_id").notEmpty().isNumeric(),
    body('sig').notEmpty(),
], 'BidRegistrationController@register');

module.exports = Router.export();