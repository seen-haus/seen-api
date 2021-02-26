const CollectableModel = require("./collectable")
const CollectableWinnerModel = require("./collectable-winner")
const ArtistModel = require("./artist")
const UserModel = require("./user")
const SpotlightModel = require("./spotlight")
const NFTTokenModel = require("./NFTtoken")
const EventModel = require("./event")

module.exports = Object.freeze({
    CollectableModel, UserModel, ArtistModel, EventModel, CollectableWinnerModel, SpotlightModel, NFTTokenModel
});
