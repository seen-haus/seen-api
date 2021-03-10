const CollectableModel = require("./collectable")
const CollectableWinnerModel = require("./collectable-winner")
const ArtistModel = require("./artist")
const UserModel = require("./user")
const SpotlightModel = require("./spotlight")
const EventModel = require("./event")
const MediaModel = require("./media")

module.exports = Object.freeze({
    CollectableModel, UserModel, ArtistModel, EventModel, CollectableWinnerModel, SpotlightModel, MediaModel
});
