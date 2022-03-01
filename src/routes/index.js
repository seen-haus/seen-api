'use strict';

const LeaderboardRoutes = require('./leaderboard.routes')
const UserRoutes = require('./user.routes')
const Bespoke = require('./bespoke.routes')
const Collectable = require('./collectable.routes')
const Spotlight = require('./spotlight.routes')
const Admin = require('./admin.routes')
const Artist = require('./artist.routes')
const Claim = require('./claim.routes');
const BidRegistration = require('./bid-registration.routes');
const IPFS = require('./ipfs.routes');

module.exports = app => {
    app.use("", Bespoke);
    app.use("", UserRoutes);
    app.use("", LeaderboardRoutes);
    app.use("", Collectable);
    app.use("", Spotlight);
    app.use("", Admin);
    app.use("", Artist);
    app.use("", Claim);
    app.use("", BidRegistration);
    app.use("", IPFS);
}
