'use strict';

const Router = require("./Router");
const {body} = require('express-validator');


Router.post('/spotlight/', [
    body('email').isEmail(),
    body('name').isLength({min: 2}),
    body('socials').isLength({min: 10}),
    body('info').isLength({min: 20}),
    body('work').isLength({min: 20}),
], 'SpotlightController@submit');

module.exports = Router.export();
