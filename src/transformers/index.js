const ArtistTransformer = require("./artist")
const ArtistOutputTransformer = require("./artist/output")
const CollectableTransformer = require("./collectable")
const CollectableOutputTransformer = require("./collectable/output")
const CollectableSaleTangibleTransformer = require("./collectable/sale")
const CollectableAuctionTransformer = require("./collectable/auction")
const MediaTransformer = require("./media")
const MediaOutputTransformer = require("./media/output")

module.exports = Object.freeze({
    ArtistTransformer,
    ArtistOutputTransformer,
    CollectableTransformer,
    CollectableOutputTransformer,
    CollectableSaleTangibleTransformer,
    CollectableAuctionTransformer,
    MediaTransformer,
    MediaOutputTransformer
});
