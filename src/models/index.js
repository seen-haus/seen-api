const CollectableModel = require("./collectable")
const CollectableWinnerModel = require("./collectable-winner")
const ArtistModel = require("./artist")
const UserModel = require("./user")
const SpotlightModel = require("./spotlight")
const EventModel = require("./event")
const MediaModel = require("./media")
const ClaimModel = require("./claim")
const EligibleClaimantModel = require("./eligible-claimant")
const BidRegistrationModel = require("./bid-registration")
const FeaturedDropModel = require("./featured-drop")
const IPFSMediaModel = require("./ipfs-media")
const UserEmailPreferencesModel = require("./user-email-preferences");
const TagModel = require("./tag");
const TagToCollectableModel = require("./tag-to-collectable");
const FallbackWorkerConsignmentEventBlockTrackerModel = require('./fallback-worker-consignment-event-block-tracker');
const EthPriceCacheModel = require("./eth-price-cache");
const SecondaryMarketListingModel = require("./secondary-market-listing");
const SelfMintingInternalAccessRequests = require("./self-minting-internal-access-requests");
const ClaimAgainstTokenContractsModel = require("./claim-against-token-contracts");
const TokenHolderBlockTrackerModel = require("./token-holder-block-tracker");
const TokenCacheModel = require("./token-cache");
const TicketCacheModel = require("./ticket-cache");
const ConsignmentIdToTicketMetadataModel = require("./consignment-id-to-ticket-metadata");

module.exports = Object.freeze({
    CollectableModel,
    UserModel,
    ArtistModel,
    EventModel,
    CollectableWinnerModel,
    SpotlightModel,
    MediaModel,
    ClaimModel,
    EligibleClaimantModel,
    BidRegistrationModel,
    FeaturedDropModel,
    IPFSMediaModel,
    UserEmailPreferencesModel,
    TagModel,
    TagToCollectableModel,
    FallbackWorkerConsignmentEventBlockTrackerModel,
    EthPriceCacheModel,
    SecondaryMarketListingModel,
    SelfMintingInternalAccessRequests,
    ClaimAgainstTokenContractsModel,
    TokenHolderBlockTrackerModel,
    TokenCacheModel,
    TicketCacheModel,
    ConsignmentIdToTicketMetadataModel,
});
