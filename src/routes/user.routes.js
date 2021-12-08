'use strict';

const {body} = require('express-validator');

const Router = require("./Router");

Router.post('/users/usernames', [
    body("walletAddresses").notEmpty(),
], 'UserController@resolveUsernames');

Router.post('/users/avatars/', [
    body('files').notEmpty(),
], 'UserController@avatar');

Router.post('/users/banners/', [
    body('files').notEmpty(),
], 'UserController@banner');

Router.get('/users/:walletAddress', [], 'UserController@show');
Router.get('/users/:walletAddress/username', [], 'UserController@resolveUsername');

// Router.post('/users/', [], 'UserController@create');
Router.put('/users/:walletAddress', [
    body("sig").notEmpty().isString(),
    body("username").optional().isLength({min: 2, max: 100}),
    body("description").optional().isLength({max: 1024}),
    body("email").optional().isEmail(),
    body("website").optional().isURL().isLength({max: 100}),
    body("twitter").optional().isURL().isLength({max: 100}),
    body("instagram").optional().isURL().isLength({max: 100}),
], 'UserController@update');
Router.post('/users/:walletAddress', [
    body("sig").notEmpty().isString(),
    body("username").optional().isString().isLength({min: 2, max: 100}),
    body("description").optional().isString().isLength({max: 1024}),
    body("email").optional().isEmail(),
    body("website").optional().isString().isURL().isLength({max: 100}),
    body("twitter").optional().isString().isURL().isLength({max: 100}),
    body("instagram").optional().isURL().isLength({max: 100}),
], 'UserController@update');
Router.post('/users/:walletAddress/get-email-address-and-preferences', [
    body("signature").notEmpty().isString(),
    body("msg").notEmpty().isJSON(),
], 'UserController@getEmailAndPreferences');
Router.post('/users/:walletAddress/update-email-address-and-preferences', [
    body("signature").notEmpty().isString(),
    body("msg").notEmpty().isJSON(),
    body("email").notEmpty().isEmail(),
    body("global_disable").notEmpty().isBoolean(),
    body("outbid").notEmpty().isBoolean(),
    body("claim_page_go_live").notEmpty().isBoolean(),
], 'UserController@updateEmailAndPreferences');
Router.post('/users/:walletAddress/delete-email-address', [
    body("signature").notEmpty().isString(),
    body("msg").notEmpty().isJSON(),
], 'UserController@deleteEmail');

module.exports = Router.export();
