'use strict';

const LeaderboardRoutes = require('./leaderboard.routes')
const UserRoutes = require('./user.routes')
const Bespoke = require('./bespoke.routes')
const Collectable = require('./collectable.routes')
const Spotlight = require('./spotlight.routes')

module.exports = app => {
    app.use("", Bespoke)
    app.use("", UserRoutes)
    app.use("", LeaderboardRoutes)
    app.use("", Collectable)
    app.use("", Spotlight)
}
