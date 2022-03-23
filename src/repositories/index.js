const ArtistRepository = require("./ArtistRepository");
const EventRepository = require("./EventRepository");
const CollectableRepository = require("./CollectableRepository");
const CollectableWinnerRepository = require("./CollectableWinnerRepository");
const SpotlightRepository = require("./SpotlightRepository");
const UserRepository = require("./UserRepository");
const MediaRepository = require("./MediaRepository");
const ClaimRepository = require("./ClaimRepository");
const EligibleClaimantRepository = require("./EligibleClaimantRepository");
const AuthRepository = require("./AuthRepository");
const BidRegistrationRepository = require("./BidRegistrationRepository");
const FeaturedDropRepository = require("./FeaturedDropRepository");
const IPFSMediaRepository = require("./IPFSMediaRepository");
const UserEmailPreferencesRepository = require("./UserEmailPreferencesRepository");
const TagRepository = require("./TagRepository");
const TagToCollectableRepository = require("./TagToCollectableRepository");
const FallbackWorkerConsignmentEventBlockTrackerRepository = require("./FallbackWorkerConsignmentEventBlockTrackerRepository");
const EthPriceCacheRepository = require("./EthPriceCacheRepository");
const SecondaryMarketListingRepository = require("./SecondaryMarketListingRepository");
const ClaimAgainstTokenContractsRepository = require("./ClaimAgainstTokenContractsRepository");

module.exports = Object.freeze({
    ArtistRepository,
    EventRepository,
    CollectableRepository,
    CollectableWinnerRepository,
    SpotlightRepository,
    UserRepository,
    MediaRepository,
    ClaimRepository,
    EligibleClaimantRepository,
    AuthRepository,
    BidRegistrationRepository,
    FeaturedDropRepository,
    IPFSMediaRepository,
    UserEmailPreferencesRepository,
    TagRepository,
    TagToCollectableRepository,
    FallbackWorkerConsignmentEventBlockTrackerRepository,
    EthPriceCacheRepository,
    SecondaryMarketListingRepository,
    ClaimAgainstTokenContractsRepository,
});
