'use strict';

const {body} = require('express-validator');

const Router = require("./Router");
/**
 * Curation
 */
Router.get(`/curation/candidates`, [], 'CurationController@candidates');

module.exports = Router.export();
