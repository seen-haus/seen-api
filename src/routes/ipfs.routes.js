'use strict';

const {body} = require('express-validator');

const Router = require("./Router");

Router.post('/ipfs/pin/file/', [
    body('files').notEmpty(),
    body('msg').notEmpty(),
    body('signature').notEmpty(),
], 'IPFSController@pinFile');

Router.post('/ipfs/pin/json/', [
    body('signature').notEmpty().isString(),
], 'IPFSController@pinJSON');

module.exports = Router.export();
