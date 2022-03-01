const Web3Service = require("./web3.service");
const BidEventHandlerV1 = require("../handlers/v1/BidEventHandler");
const BidEventHandlerV2 = require("../handlers/v2/BidEventHandler");
const BidEventHandlerV3 = require("../handlers/v3/BidEventHandler");
const PurchaseEventHandlerV3 = require("../handlers/v3/PurchaseEventHandler");
const BuyEventHandlerV1 = require("../handlers/v1/BuyEventHandler");
const {
    ArtistRepository,
    CollectableRepository,
    NFTTokenRepository,
    MediaRepository,
    FallbackWorkerConsignmentEventBlockTrackerRepository,
} = require("../repositories");
const EcommerceV1Abi = require("../abis/v1/Ecommerce.json");
const NFTV1Abi = require("../abis/v1/NFTSale.json");
const AuctionV1Abi = require("../abis/v1/EnglishAuction.json");
const AuctionV2Abi = require("../abis/v2/EnglishAuction.json");
const AuctionV3Abi = require("../abis/v3/auctionRunnerABI.json");
const SaleV3Abi = require("../abis/v3/saleRunnerABI.json");
const MarketHandlersV3 = require("./../constants/MarketHandlers");
const {SALE, AUCTION} = require("./../constants/PurchaseTypes");
const {V1, V2, V3} = require("./../constants/Versions");
const {NFT, TANGIBLE_NFT, TANGIBLE} = require("./../constants/Collectables");
const {REGULAR} = require("./../constants/Categories");
const ArtistTransformer = require("./../transformers/artist");
const CollectableTransformer = require("./../transformers/collectable");
const MediaTransformer = require("./../transformers/media");
const urlParse = require('url-parse');
module.exports = {

    /**
     *
     * @param data
     * @param media
     * @return {Promise<(*|*|{meta: {pagination: *|module.Pagination.pagination|{per_page: module.Pagination.perPage, total: module.Pagination.data.total, count: module.Pagination.data.results.length, total_pages: number, current_page: module.Pagination.page|number}}, paginatedData: *}|boolean)[]>}
     */
    async createCollectible(data, media = []) {
        let collectable = await this.createOrUpdateCollectable(data);
        media = await this.associateMedia(media, collectable)
        return collectable
    },

    /**
     *
     * @param collectableData
     * @return {Promise<{meta: {pagination: *}, paginatedData: *}|boolean>}
     */
    async createOrUpdateCollectable(collectableData) {
        let collectable = await CollectableRepository.findByColumn('contract_address', collectableData.name);
        collectableData = CollectableTransformer.transform(collectableData)
        if (!collectable) {
            collectable = await CollectableRepository
                .create(collectableData)
                .catch(e => {
                    console.error(e);
                    return false;
                });
        } else {
            collectable = await CollectableRepository
                .update(collectableData, collectable.id)
                .catch(e => {
                    console.error(e);
                    return false;
                });
        }

        return collectable;
    },

    async associateMedia(mediaData, collectable) {
        let i = 0;
        for (const itemId of mediaData) {
            let media = await MediaRepository.find(itemId);
            if (media) {
                await MediaRepository.update({collectable_id: collectable.id, position: i}, media.id);
                i++
            }
        }
        return true;
    },

    /**
     *
     * @param artistData
     * @return {Promise<{meta: {pagination: *}, paginatedData: *}|boolean>}
     */
    async createOrUpdateArtist(artistData) {
        let artist = await ArtistRepository.findByColumn('name', artistData.name);
        artistData = ArtistTransformer.transform(artistData)
        if (!artist) {
            artist = await ArtistRepository
                .create(artistData)
                .catch(e => {
                    console.error(e);
                    return false;
                });
        } else {
            artist = await ArtistRepository
                .update(artistData, artist.id)
                .catch(e => {
                    console.error(e);
                    return false;
                });
        }

        return artist;
    },

    // /**
    //  *
    //  * @param tokenData
    //  * @return {Promise<{meta: {pagination: *}, paginatedData: *}|boolean>}
    //  */
    // async createOrUpdateToken(tokenData) {
    //     let tokenDB = await NFTTokenRepository.findByColumn('tx', tokenData.tx);
    //     console.log("TOKEN FOUND", tokenDB)
    //     let token;
    //     tokenData = NFTTokenTransformer.transform(tokenData)
    //     if (!tokenDB) {
    //         token = await NFTTokenRepository
    //             .create(tokenData)
    //             .catch(e => {
    //                 console.error(e);
    //                 return false;
    //             });
    //     } else {
    //         await NFTTokenRepository
    //             .update(tokenData, tokenDB.id)
    //             .catch(e => {
    //                 console.error(e);
    //                 return false;
    //             });
    //         token = await NFTTokenRepository.findByColumn('tx', tokenData.tx);
    //     }
    //
    //     return token;
    // },

    /**
     *  Migration function (temp)
     * @param purchaseType
     * @param type
     * @param data
     * @param artist
     * @param token
     * @return {Promise<void>}
     */
    async migrateCollectible(type, purchaseType, data, artist, media) {
        if (artist.avatar.includes("https://d2n6rvskq73172.cloudfront.net/")) {
            artist.avatar = artist.avatar.replace("https://d2n6rvskq73172.cloudfront.net/", "https://assets.seen.haus/");
        }
        artist.socials = artist.socials == 'string' ? JSON.parse(artist.socials) : artist.socials
        artist.socials = artist.socials.map(social => {
            let url = new URL(social.url)
            return {
                url: social.url,
                type: social.title.toLowerCase(),
                handle: url.pathname.replace(/\//g, "")
            }
        });
        artist = await this.createOrUpdateArtist(artist);

        let resolveCategory = (data) => {
            switch (type) {
                case TANGIBLE:
                    return REGULAR
                    break;
                case TANGIBLE_NFT:
                    return REGULAR;
                    break;
                default:
                    return REGULAR;
            }
        }


        let payload = {
            artist_id: artist.id,
            purchase_type: purchaseType,
            type,
            contract_address: data.contract_address,
            created_at: data.created_at,
            updated_at: data.updated_at,
            is_sold_out: 1,
            slug: data.slug,
            artist_statement: data.artist_statement,
            starts_at: data.starts_at,
            ends_at: data.ends_at,
            available_qty: data.available_qty,
            title: data.title,
            medium: data.info ? data.info : data.tangible_item_info,
            edition: data.edition,
            edition_of: data.edition_of,
            description: data.description,
            is_active: 1,
            start_bid: data.start_bid,
            min_bid: data.min_bid,
            version: 1,
            winner_address: data.winner_address,
            price: data.price,
            category: resolveCategory(data),
            nft_contract_address: data.nft_contract_address,
            nft_ipfs_hash: data.nft_ipfs_hash,
            nft_token_id: data.nft_token_id
        }
        let collectable = await CollectableRepository.create(payload);
        await this.migrateMedia(collectable, media);
        console.log("FILLL EVENTS")
        await this.fillEvents(collectable);

        return collectable;
    },

    async migrateMedia(collectable, media) {
        media = typeof media === 'string' ? JSON.parse(media) : media;
        for (let i = 0; i < media.length; i++) {
            let item = media[i]
            let url = urlParse(item.url)

            let path = item.url.charAt(0) === '/'
                ? url.pathname.substr(1, url.pathname.length)
                : url.pathname

            // TODO test
            if (item.url.includes("https://d2n6rvskq73172.cloudfront.net/")) {
                item.url = item.url.replace("https://d2n6rvskq73172.cloudfront.net/", "https://assets.seen.haus/");
            }

            await MediaRepository.create({
                type: item.type,
                url: item.url,
                position: i,
                origin_url: "https://seen-assets.s3-us-west-2.amazonaws.com" + url.pathname,
                path,
                collectable_id: collectable.id,
            })
        }
        return true;
    },

    async fillEvents(collectable) {

        console.log({collectable})

        if (!collectable) {
            console.log("NO collectable")
            process.exit();
        }

        let abi, event, handler, filter, consignmentEventBlockTrackerRecord;
        let overrideStartBlock = false;
        if(collectable.version === V3) {
            // Get latest checked event block for consignment
            // This strategy does assume that a whole block's events were successfully indexed without failure
            if(collectable.market_type === 1) {
                consignmentEventBlockTrackerRecord = await FallbackWorkerConsignmentEventBlockTrackerRepository.findByColumn('secondary_consig_id', collectable.consignment_id);
            } else {
                consignmentEventBlockTrackerRecord = await FallbackWorkerConsignmentEventBlockTrackerRepository.findByColumn('consignment_id', collectable.consignment_id);
            }
            if(consignmentEventBlockTrackerRecord && consignmentEventBlockTrackerRecord.latest_checked_block_number) {
                overrideStartBlock = consignmentEventBlockTrackerRecord.latest_checked_block_number + 1; // Add 1 because we don't need to check the latest checked block again, i.e. the startBlock is inclusive
            }
            switch (collectable.market_handler_type) {
                case MarketHandlersV3.SALE:
                    event = 'Purchase'
                    handler = PurchaseEventHandlerV3;
                    abi = SaleV3Abi;
                    filter = {consignmentId: collectable.consignment_id.toString()} // Make sure to use toString in the filter or else it will ignore the consignmentId
                    break;
                case MarketHandlersV3.AUCTION:
                    event = 'BidAccepted'
                    handler = BidEventHandlerV3;
                    abi = AuctionV3Abi;
                    filter = {consignmentId: collectable.consignment_id.toString()} // Make sure to use toString in the filter or else it will ignore the consignmentId
                    break;
            }
        } else if(collectable.version === V1 || collectable.version === V2) {
            switch (collectable.purchase_type) {
                case SALE:
                    event = 'Buy'
                    handler = BuyEventHandlerV1;
                    if (collectable.type === NFT) {
                        abi = collectable.version === V1
                            ? NFTV1Abi
                            : NFTV1Abi;
                    }
                    if (collectable.type === TANGIBLE) {
                        abi = collectable.version === V1
                            ? EcommerceV1Abi
                            : EcommerceV1Abi;
                    }
                    if (collectable.type === TANGIBLE_NFT) {
                        abi = collectable.version === V1
                            ? EcommerceV1Abi
                            : EcommerceV1Abi;
                    }
                    break;
                case AUCTION:
                    console.log("Bid")
                    if (collectable.version === V2) {
                        event = 'Bid';
                        handler = BidEventHandlerV2;
                        abi = AuctionV2Abi;
                    } else if(collectable.version === V1) {
                        event = 'Bid';
                        handler = BidEventHandlerV1;
                        abi = AuctionV1Abi;
                    }
                    break;
            }
        }
        console.log({overrideStartBlock})
        let service = new Web3Service(collectable.contract_address, abi);
        let events = await service.findEvents(event, true, filter, overrideStartBlock);
        console.log({'event length': events.length, 'consignmentId': collectable.consignment_id, event})
        let latestEventBlock = 0;
        for (let i = 0; i < events.length; i++) {
            console.log({'events[i]': events[i], 'events[i].raw': events[i].raw})
            await (new handler(collectable)).handle(events[i], i, events);
            if(events[i].blockNumber > latestEventBlock) {
                latestEventBlock = events[i].blockNumber;
            }
        }

        if((collectable.version === V3) && (latestEventBlock > 0) && (events.length > 0)) {
            // Save latest event block so that we don't keep fetching events that have already been indexed
            // This strategy does assume that a whole block's events were successfully indexed without failure
            if(consignmentEventBlockTrackerRecord === null) {
                await FallbackWorkerConsignmentEventBlockTrackerRepository.create({
                    ...(collectable.market_type === 1 && {'secondary_consig_id': collectable.consignment_id, 'consignment_id': null}),
                    ...(collectable.market_type !== 1 && {'consignment_id': collectable.consignment_id, 'secondary_consig_id': null}),
                    'latest_checked_block_number': latestEventBlock,
                });
            } else {
                await FallbackWorkerConsignmentEventBlockTrackerRepository.update({'latest_checked_block_number': latestEventBlock}, consignmentEventBlockTrackerRecord.id);
            }
        }

        return true
    },

};
