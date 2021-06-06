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
});
