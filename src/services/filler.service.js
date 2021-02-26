const Web3Service = require("./web3.service");
const BidEventHandlerV1 = require("../handlers/v1/BidEventHandler");
const BuyEventHandlerV1 = require("../handlers/v1/BuyEventHandler");
const {ArtistRepository, CollectableRepository, NFTTokenRepository} = require("../repositories");
const EcommerceV1Abi = require("../abis/v1/Ecommerce.json");
const NFTV1Abi = require("../abis/v1/NFTSale.json");
const AuctionV1Abi = require("../abis/v1/EnglishAuction.json");
const {SALE, AUCTION} = require("./../constants/PurchaseTypes");
const {V1, V2} = require("./../constants/Versions");
const {NFT, TANGIBLE_NFT, TANGIBLE} = require("./../constants/Collectables");
const {REGULAR, MERCH, SEEN_EXCLUSIVE} = require("./../constants/Categories");
const ArtistTransformer = require("./../transformers/artist");
const NFTTokenTransformer = require("./../transformers/nft_token");
const CollectableTransformer = require("./../transformers/collectable");

module.exports = {

    /**
     *
     * @param data
     * @param artist
     * @param token
     * @return
     */
    async createCollectible(data, artist, token = null) {
        artist = await this.createOrUpdateArtist(artist);
        if (token) {
            token = await this.createOrUpdateToken(artist);
        }
        data.artist_id = artist.id
        data.token_id = token.id

        return await this.createOrUpdateCollectable(data);
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

    /**
     *
     * @param tokenData
     * @return {Promise<{meta: {pagination: *}, paginatedData: *}|boolean>}
     */
    async createOrUpdateToken(tokenData) {
        let tokenDB = await NFTTokenRepository.findByColumn('tx', tokenData.tx);
        console.log("TOKEN FOUND", tokenDB)
        let token;
        tokenData = NFTTokenTransformer.transform(tokenData)
        if (!tokenDB) {
            token = await NFTTokenRepository
                .create(tokenData)
                .catch(e => {
                    console.error(e);
                    return false;
                });
        } else {
            await NFTTokenRepository
                .update(tokenData, tokenDB.id)
                .catch(e => {
                    console.error(e);
                    return false;
                });
            token = await NFTTokenRepository.findByColumn('tx', tokenData.tx);
        }

        return token;
    },

    /**
     *  Migration function (temp)
     * @param purchaseType
     * @param type
     * @param data
     * @param artist
     * @param token
     * @return {Promise<void>}
     */
    async migrateCollectible(type, purchaseType, data, artist, token = null) {
        artist = await this.createOrUpdateArtist(artist);

        if (token) {
            token = await this.createOrUpdateToken(token);
        }

        let resolveCategory = (data) => {
            switch (type) {
                case TANGIBLE:
                    return MERCH
                    break;
                case TANGIBLE_NFT:
                    return data.is_seen_exclusive ? SEEN_EXCLUSIVE : REGULAR;
                    break;
                default:
                    return REGULAR;
            }
        }

        let payload = {
            artist_id: artist.id,
            token_id: token ? token.id : null,
            purchase_type: purchaseType,
            type,
            media: data.media,
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
            type_description: data.info ? data.info : data.tangible_item_info,
            edition: data.edition,
            edition_of: data.edition_of,
            description: data.description,
            is_active: 1,
            start_bid: data.start_bid,
            min_bid: data.min_bid,
            version: 1,
            winner_address: data.winner_address,
            price: data.price,
            category: resolveCategory(data)
        }
        let collectable = await CollectableRepository.create(payload);
        console.log("FILLL EVENTS")
        await this.fillEvents(collectable);

        return collectable;
    },

    async fillEvents(collectable) {

        if (!collectable) {
            console.log("NO collectable")
            process.exit();
        }

        let abi, event, handler;
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
                break;
            case AUCTION:
                console.log("AUCTION")
                event = 'Bid'
                handler = BidEventHandlerV1;
                abi = collectable.version === V1
                    ? AuctionV1Abi
                    : AuctionV1Abi;
                break;
        }

        let service = new Web3Service(collectable.contract_address, abi);
        let events = await service.findEvents(event)
        for (let i = 0; i < events.length; i++) {
            await (new handler(collectable)).handle(events[i]);
        }

        return true
    },

};
