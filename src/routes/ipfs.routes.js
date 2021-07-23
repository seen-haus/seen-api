'use strict';

const {body} = require('express-validator');

const Router = require("./Router");

Router.post('/ipfs/pin/', [
    body('files').notEmpty(),
], 'IPFSController@pinFile');

module.exports = Router.export();
