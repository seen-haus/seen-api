'use strict';
const {body} = require('express-validator');
const Router = require("./Router");

Router.get('/claims/:contractAddress', [], 'ClaimController@show');

Router.post('/claims/:contractAddress/claim', [
  body("wallet_address").notEmpty().isEthereumAddress(),
  body("email").notEmpty().isEmail(),
  body("first_name").notEmpty().isString(),
  body("last_name").notEmpty().isString(),
  body("address").notEmpty().isString(),
  body("city").notEmpty().isString(),
  body("zip").notEmpty(),
  body("country").notEmpty().isString(),
  body('sig').notEmpty(),
], 'ClaimController@claim');

Router.post('/claim-against-token-contract/:claimAgainstTokenContractAddress', [
  body("wallet_address").notEmpty().isEthereumAddress(),
  body("email").notEmpty().isEmail(),
  body("first_name").notEmpty().isString(),
  body("last_name").notEmpty().isString(),
  body("address").notEmpty().isString(),
  body("city").notEmpty().isString(),
  body("zip").notEmpty(),
  body("country").notEmpty().isString(),
  body('signature').notEmpty().isString(),
  body("msg").notEmpty().isJSON(),
], 'ClaimAgainstTokenContractsController@submitShippingInfoAgainstClaim')

Router.post('/claim-against-token-contract/fetch-submitted-shipping/:claimAgainstTokenContractAddress', [
  body('signature').notEmpty().isString(),
  body("msg").notEmpty().isJSON(),
], 'ClaimAgainstTokenContractsController@fetchSubmittedShippingInfoAgainstClaim')

Router.get('/claim-against-token-contract/check-has-submitted-shipping/:claimAgainstTokenContractAddress/:claimAgainstTokenContractWalletAddress', [], 'ClaimAgainstTokenContractsController@checkHasSubmittedShippingInfoAgainstClaim')

module.exports = Router.export();
