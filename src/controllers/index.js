const LeaderboardController = require('./LeaderboardController');
const UserController = require('./UserController');
const BespokeController = require('./BespokeController');
const SpotlightController = require('./SpotlightController');
const CollectableController = require('./CollectableController');
const AuthController = require('./AuthController');
const ArtistController = require('./ArtistController');
const ClaimController = require('./ClaimController');

// Private
const AdminArtistController = require('./AdminArtistController');
const AdminCollectableController = require('./AdminCollectableController');
const AdminConstantsController = require('./AdminConstantsController');
const AdminMediaController = require('./AdminMediaController');
const AdminSpotlightController = require("./AdminSpotlightController")

module.exports = {
    LeaderboardController,
    UserController,
    BespokeController,
    SpotlightController,
    CollectableController,
    AdminArtistController,
    AdminCollectableController,
    AdminConstantsController,
    AdminMediaController,
    AuthController,
    ArtistController,
    ClaimController,
    AdminSpotlightController
};
