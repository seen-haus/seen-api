const ArtistTransformer = require("./artist")
const ArtistOutputTransformer = require("./artist/output")
const CollectableTransformer = require("./collectable")
const CollectableOutputTransformer = require("./collectable/output")
const CollectableSaleTangibleTransformer = require("./collectable/sale")
const CollectableAuctionTransformer = require("./collectable/auction")
const MediaTransformer = require("./media")
const MediaOutputTransformer = require("./media/output")
const UserTransformer = require("./user")
const UserOutputTransformer = require("./user/output")
const UserEmailPreferencesTransformer = require("./user_email_preferences");
const UserEmailPreferencesOutputTransformer = require("./user_email_preferences/output");
const FeaturedDropTransformer = require("./featured_drop")
const SecondaryMarketListingAuctionTransformer = require("./secondary_market_listing/auction");
const SecondaryMarketListingSaleTransformer = require("./secondary_market_listing/sale");
const SecondaryMarketListingOutputTransformer = require("./secondary_market_listing/output");

module.exports = Object.freeze({
    ArtistTransformer,
    ArtistOutputTransformer,
    CollectableTransformer,
    CollectableOutputTransformer,
    CollectableSaleTangibleTransformer,
    CollectableAuctionTransformer,
    MediaTransformer,
    MediaOutputTransformer,
    UserTransformer,
    UserOutputTransformer,
    UserEmailPreferencesTransformer,
    UserEmailPreferencesOutputTransformer,
    FeaturedDropTransformer,
    SecondaryMarketListingAuctionTransformer,
    SecondaryMarketListingSaleTransformer,
    SecondaryMarketListingOutputTransformer,
});
