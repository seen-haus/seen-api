const ArtistTransformer = require("./artist")
const ArtistOutputTransformer = require("./artist/output")
// const CollectableTransformer = require("./collectable")
const CollectableOutputTransformer = require("./collectable/output")
const NFTTokenTransformer = require("./nft_token")
const NFTTokenOutputTransformer = require("./nft_token/output")
module.exports = Object.freeze({
    ArtistTransformer,
    ArtistOutputTransformer,
    // CollectableTransformer,
    CollectableOutputTransformer,
    NFTTokenTransformer,
    NFTTokenOutputTransformer
});
