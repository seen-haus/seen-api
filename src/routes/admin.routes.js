'use strict';

const Router = require("./Router");
const {body} = require('express-validator');
const ethers = require('ethers');
const { authenticateJWT, authenticateShippingInfoJWT } = require("../middleware/authenticate")
const isETHAddress = (value) => {
    try {
        return ethers.utils.isAddress(value)
    } catch (e) {
        console.log(e)
        return false;
    }
}

const categories = require("../constants/Categories");
const collectables = require("../constants/Collectables");
const purchaseTypes = require("../constants/PurchaseTypes");
const versions = require("../constants/Versions");

const checkCollectable = (value) => {
    try {
        return Object.values(collectables).includes(value)
    } catch (e) {
        console.log(e)
        return false;
    }
}

const checkPurchaseType = (value) => {
    try {
        return Object.values(purchaseTypes).includes(value)
    } catch (e) {
        console.log(e)
        return false;
    }
}

const checkCategory = (value) => {
    try {
        return Object.values(categories).includes(value)
    } catch (e) {
        console.log(e)
        return false;
    }
}

const checkVersion = (value) => {
    try {
        return Object.values(versions).includes(value)
    } catch (e) {
        console.log(e)
        return false;
    }
}

/**
 * Artist
 */
Router.post('/admin/artists/', [
    authenticateJWT,
    body('name').isLength({min: 2}),
    body("email").optional().isEmail(),
    body('avatar')
        .notEmpty()
        .isURL(),
    body('socials').notEmpty()
], 'AdminArtistController@store');

Router.put('/admin/artists/:id', [
    authenticateJWT,
    body('name').isLength({min: 2}),
    body("email").optional().isEmail(),
    body('avatar')
        .notEmpty()
        .isURL(),
    body('socials').notEmpty()
], 'AdminArtistController@update');

Router.delete('/admin/artists/:id', [authenticateJWT], 'AdminArtistController@delete');


/**
 * Collectable
 */

Router.post('/admin/collectables/', [
    authenticateJWT,
    body('title').notEmpty().isLength({min: 2}),
    body('description').notEmpty(),
    body('slug').notEmpty().isLength({min: 2}),
    body('medium').notEmpty().isLength({min: 2}),
    body('type').notEmpty().custom(checkCollectable),
    body('purchase_type').notEmpty().custom(checkPurchaseType),
    body('category').notEmpty().custom(checkCategory),
    body('version').notEmpty().custom(checkVersion),
    body('starts_at').notEmpty(),
    body('ends_at').if((value, {req}) => (req.body.purchase_type === purchaseTypes.AUCTION) && !req.body.is_reserve_price_auction).notEmpty(),
    body('is_active').isBoolean(),
    body('is_hidden_from_drop_list').isBoolean(),
    body('is_reserve_price_auction').isBoolean(),
    body('is_open_edition').isBoolean(),
    body('auto_generate_claim_page').isBoolean(),
    // body('contract_address').notEmpty().custom(isETHAddress),
    // body('nft_contract_address').exists().custom(isETHAddress),
    body('min_bid').if((value, {req}) => req.body.purchase_type === purchaseTypes.AUCTION).notEmpty(),
    body('price').if((value, {req}) => req.body.purchase_type === purchaseTypes.SALE).notEmpty().isNumeric(),
    body('available_qty').if((value, {req}) => req.body.purchase_type === purchaseTypes.SALE).notEmpty().isNumeric(),
    body('edition').if((value, {req}) => req.body.purchase_type === purchaseTypes.AUCTION).notEmpty().isNumeric(),
    body('artist_id').notEmpty().isNumeric(),
    body('edition_of').notEmpty().isNumeric(),
], 'AdminCollectableController@store');

Router.put('/admin/collectables/:id', [
    authenticateJWT,
    body('title').notEmpty().isLength({min: 2}),
    body('description').notEmpty(),
    body('slug').notEmpty().isLength({min: 2}),
    body('medium').notEmpty().isLength({min: 2}),
    body('type').notEmpty().custom(checkCollectable),
    body('purchase_type').notEmpty().custom(checkPurchaseType),
    body('category').notEmpty().custom(checkCategory),
    body('version').notEmpty().custom(checkVersion),
    body('starts_at').notEmpty(),
    body('ends_at').if((value, {req}) => (req.body.purchase_type === purchaseTypes.AUCTION) && !req.body.is_reserve_price_auction).notEmpty(),
    body('is_active').isBoolean(),
    body('is_hidden_from_drop_list').isBoolean(),
    body('is_reserve_price_auction').isBoolean(),
    body('is_open_edition').isBoolean(),
    body('auto_generate_claim_page').isBoolean(),
    // body('contract_address').notEmpty().custom(isETHAddress),
    // body('nft_contract_address').exists().custom(isETHAddress),
    body('min_bid').if((value, {req}) => req.body.purchase_type === purchaseTypes.AUCTION).notEmpty(),
    body('price').if((value, {req}) => req.body.purchase_type === purchaseTypes.SALE).notEmpty().isNumeric(),
    body('available_qty').if((value, {req}) => req.body.purchase_type === purchaseTypes.SALE).notEmpty().isNumeric(),
    body('edition').if((value, {req}) => req.body.purchase_type === purchaseTypes.AUCTION).notEmpty().isNumeric(),
    body('artist_id').notEmpty().isNumeric(),
    body('edition_of').notEmpty().isNumeric(),
], 'AdminCollectableController@update');

Router.put('/admin/collectables/contract-and-token-data/:id', [
    authenticateJWT,
    body('purchase_type').notEmpty().custom(checkPurchaseType),
    body('contract_address').notEmpty().custom(isETHAddress),
    body('nft_contract_address').exists().custom(isETHAddress),
    body('nft_token_id').notEmpty(),
], 'AdminCollectableController@updateContractAndTokenData');

Router.delete('/admin/collectables/:id', [authenticateJWT], 'AdminCollectableController@delete');

Router.put('/admin/update-hero', [
    authenticateJWT,
    body('collectable_id').notEmpty().isNumeric(),
], 'AdminFeaturedDropController@update');

Router.post('/admin/claims/', [
    authenticateJWT,
    body('collectable_id').notEmpty().isNumeric(),
    body('is_active').notEmpty().isBoolean(),
    body('requires_message').notEmpty().isBoolean(),
], 'AdminClaimController@store');

Router.post('/admin/eligible-claimant/', [
    authenticateJWT,
    body('claim_id').notEmpty().isNumeric(),
    body('wallet_address').notEmpty().custom(isETHAddress),
], 'AdminEligibleClaimantController@store');


/** 
 * Claims Info Handling
 */
Router.get('/admin/claims/', [authenticateShippingInfoJWT], 'AdminClaimsController@index');

/**
 * Constants
 */
Router.get('/admin/constants/', [authenticateJWT], 'AdminConstantsController@index');

/**
 *
 */
Router.get('/admin/spotlight/', [authenticateJWT], 'AdminSpotlightController@index');
/**
 * Login
 */
Router.post('/admin/login/', [
    body('password').isLength({min: 6}),
    body('wallet').isLength({min: 10}),
], 'AuthController@login');

/**
 * Media
 */
Router.post('/admin/media/', [
    authenticateJWT,
    body('files').notEmpty(),
], 'AdminMediaController@store');


Router.put('/admin/media/:id/preview', [
    authenticateJWT,
], 'AdminMediaController@preview');

Router.put('/admin/media/:id', [
    authenticateJWT,
    body('position').isNumeric().notEmpty(),
    body('url').notEmpty(),
    body('path').notEmpty(),
    body('type').notEmpty(),
], 'AdminMediaController@store');


Router.delete('/admin/media/:id', [], 'AdminMediaController@delete');

module.exports = Router.export();
