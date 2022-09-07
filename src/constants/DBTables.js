// Table names
const USERS_TABLE = "users";
const COLLECTIBLES_TABLE = "collectables";
const COLLECTIBLE_WINNER_TABLE = "collectable_winner";
const CLAIMS_TABLE = "claims";
const FEATURED_DROP_TABLE = "featured_drop";
const ELIGIBLE_CLAIMANTS_TABLE = "eligible_claimants";
const NFT_TOKENS_TABLE = "nft_tokens";
const SPOTLIGHT_TABLE = "spotlight_submissions";
const EVENTS_TABLE = "events";
const ARTISTS_TABLE = "artists";
const MEDIA_TABLE = "media";
const BID_REGISTRATIONS_TABLE = "bid_registrations";
const IPFS_MEDIA_TABLE = "ipfs_media";
const USER_EMAIL_PREFERENCES_TABLE = "user_email_preferences";
const SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE = "self_minting_internal_access_requests";
const TAGS_TABLE = "tags";
const TAG_TO_COLLECTABLE_TABLE = "tag_to_collectable";
const FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE = "fw_consignment_event_block_tracker";
const ETH_PRICE_CACHE = "eth_price_cache";
const SECONDARY_MARKET_LISTINGS = "secondary_market_listings";
const CLAIM_AGAINST_TOKEN_CONTRACTS_TABLE = "claim_against_token_contracts";
const TOKEN_HOLDER_BLOCK_TRACKER_TABLE = "token_holder_block_tracker";
const TOKEN_CACHE_TABLE = "token_cache";
const TICKET_CACHE_TABLE = "ticket_cache";
const CONSIGNMENT_ID_TO_TICKET_METADATA_TABLE = "consignment_id_to_ticket_metadata";
const CUSTOM_PAYMENT_TOKENS_TABLE = "custom_payment_tokens";
const SNAPSHOT_DECLARATIONS_TABLE = "snapshot_declarations";
const SNAPSHOT_TRACKER_TABLE = "snapshot_tracker";
const SNAPSHOT_CACHE_TABLE = "snapshot_cache";
const CURATION_ROUND_DECLARATIONS_TABLE = "curation_round_declarations";
const CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE = "curation_sm_applicants_overview";
const CURATION_SELF_MINTING_APPLICANTS_VOTES_TABLE = "curation_sm_applicants_votes";

module.exports = Object.freeze({
    EVENTS_TABLE,
    COLLECTIBLES_TABLE,
    COLLECTIBLE_WINNER_TABLE,
    NFT_TOKENS_TABLE,
    SPOTLIGHT_TABLE,
    USERS_TABLE,
    ARTISTS_TABLE,
    MEDIA_TABLE,
    CLAIMS_TABLE,
    ELIGIBLE_CLAIMANTS_TABLE,
    FEATURED_DROP_TABLE,
    BID_REGISTRATIONS_TABLE,
    IPFS_MEDIA_TABLE,
    USER_EMAIL_PREFERENCES_TABLE,
    SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE,
    TAGS_TABLE,
    TAG_TO_COLLECTABLE_TABLE,
    FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE,
    ETH_PRICE_CACHE,
    SECONDARY_MARKET_LISTINGS,
    CLAIM_AGAINST_TOKEN_CONTRACTS_TABLE,
    TOKEN_HOLDER_BLOCK_TRACKER_TABLE,
    TOKEN_CACHE_TABLE,
    TICKET_CACHE_TABLE,
    CONSIGNMENT_ID_TO_TICKET_METADATA_TABLE,
    CUSTOM_PAYMENT_TOKENS_TABLE,
    SNAPSHOT_DECLARATIONS_TABLE,
    SNAPSHOT_TRACKER_TABLE,
    SNAPSHOT_CACHE_TABLE,
    CURATION_ROUND_DECLARATIONS_TABLE,
    CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE,
    CURATION_SELF_MINTING_APPLICANTS_VOTES_TABLE,
});
