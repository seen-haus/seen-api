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
const TokenHolderBlockTrackerRepository = require("./TokenHolderBlockTrackerRepository");
const TokenCacheRepository = require("./TokenCacheRepository");
const TicketCacheRepository = require("./TicketCacheRepository");
const ConsignmentIdToTicketMetadataRepository = require("./ConsignmentIdToTicketMetadataRepository");
const SelfMintingInternalAccessRequestsRepository = require("./SelfMintingInternalAccessRequestsRepository");
const SnapshotDeclarationRepository = require("./SnapshotDeclarationRepository");
const SnapshotTrackerRepository = require("./SnapshotTrackerRepository");
const SnapshotCacheRepository = require("./SnapshotCacheRepository");
const CurationRoundDeclarationRepository = require("./CurationRoundDeclarationRepository");
const CurationSelfMintingApplicantsOverviewRepository = require("./CurationSelfMintingApplicantsOverviewRepository");
const CurationSelfMintingApplicantsVotesRepository = require("./CurationSelfMintingApplicantsVotesRepository");

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
    TokenHolderBlockTrackerRepository,
    TokenCacheRepository,
    TicketCacheRepository,
    ConsignmentIdToTicketMetadataRepository,
    SelfMintingInternalAccessRequestsRepository,
    SnapshotDeclarationRepository,
    SnapshotTrackerRepository,
    SnapshotCacheRepository,
    CurationRoundDeclarationRepository,
    CurationSelfMintingApplicantsOverviewRepository,
    CurationSelfMintingApplicantsVotesRepository
});
