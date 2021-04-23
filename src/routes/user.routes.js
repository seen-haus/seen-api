'use strict';

const {body} = require('express-validator');

const Router = require("./Router");

Router.post('/users/usernames', [
    body("walletAddresses").notEmpty(),
], 'UserController@resolveUsernames');

Router.post('/users/avatars/', [
    body('files').notEmpty(),
], 'UserController@avatar');

Router.get('/users/:walletAddress', [], 'UserController@show');
Router.get('/users/:walletAddress/username', [], 'UserController@resolveUsername');

// Router.post('/users/', [], 'UserController@create');
Router.put('/users/:walletAddress', [
    body("sig").notEmpty().isString(),
    body("username").optional().isLength({min: 2, max: 100}),
    body("description").optional().isLength({max: 255}),
    body("website").optional().isURL().isLength({max: 100}),
    body("twitter").optional().isURL().isLength({max: 100})
], 'UserController@update');
Router.post('/users/:walletAddress', [
    body("sig").notEmpty().isString(),
    body("username").optional().isString().isLength({min: 2, max: 100}),
    body("description").optional().isString().isLength({max: 255}),
    body("website").optional().isString().isURL().isLength({max: 100}),
    body("twitter").optional().isString().isURL().isLength({max: 100})
], 'UserController@update');

module.exports = Router.export();
