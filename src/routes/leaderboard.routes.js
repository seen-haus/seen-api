'use strict';

const Router = require("./Router");
const { body } = require('express-validator');


Router.get('/leaderboard/', [], 'LeaderboardController@index');

module.exports = Router.export();
