'use strict';

const Router = require("./Router");
Router.get('/bespoke/', [],'BespokeController@index');

module.exports = Router.export();
