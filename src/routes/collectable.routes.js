'use strict';
const {body} = require('express-validator');
const ethers = require('ethers');

const Router = require("./Router");

const checkTokenContractAddressToTokenMappings = (value) => {
    try {
        let tokenContractAddresses = Object.keys(value);
        let invalidTrigger = false;
        for(let tokenContractAddress of tokenContractAddresses) {
            if(!ethers.utils.isAddress(tokenContractAddress)) {
                invalidTrigger = true;
            }
            for(let tokenId of value[tokenContractAddress]) {
                if(isNaN(tokenId)) {
                    invalidTrigger = true;
                }
            }
        }
        if(invalidTrigger) {
            return false;
        }
        return true;
    } catch (e) {
        console.log(e)
        return false;
    }
}

Router.get('/collectables/', [], 'CollectableController@index');

Router.post('/collectables/map', [
    body("tokenIds").notEmpty(),
], 'CollectableController@map');

Router.get('/hero', [], 'CollectableController@hero');

Router.post('/collectables/mapWithTokenContractAddress', [
    body("tokenContractAddressesToIds").notEmpty().isObject().custom(checkTokenContractAddressToTokenMappings),
], 'CollectableController@mapWithTokenContractAddress');

Router.post('/collectables/:contractAddress/winner', [
    body("wallet_address").notEmpty().isEthereumAddress(),
    body("email").notEmpty().isEmail(),
    body("first_name").notEmpty().isString(),
    body("last_name").notEmpty().isString(),
    body("address").notEmpty().isString(),
    body("city").notEmpty().isString(),
    body("zip").notEmpty(),
    body("country").notEmpty().isString(),
    body('sig').notEmpty(),
], 'CollectableController@winner');

Router.get('/collectables/:contractAddress', [], 'CollectableController@show');

Router.get('/collectables/secondary/:slug', [], 'CollectableController@showSecondary');

Router.post('/collectables/publish-consignment', [
    body("consignment_id").notEmpty().isNumeric(),
], 'CollectableController@publishCollectableFromConsignmentId');

module.exports = Router.export();
