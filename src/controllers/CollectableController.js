const Controller = require('./Controller');
const ethers = require('ethers');
const {
    SecondaryMarketListingRepository,
    CollectableRepository,
    FeaturedDropRepository,
    CollectableWinnerRepository,
    UserRepository,
    MediaRepository,
    IPFSMediaRepository,
    TagRepository,
    TagToCollectableRepository,
} = require("./../repositories");
const {
    CollectableSaleTangibleTransformer,
    CollectableAuctionTransformer, 
    UserOutputTransformer,
    UserTransformer,
    SecondaryMarketListingAuctionTransformer,
    SecondaryMarketListingSaleTransformer,
    SecondaryMarketListingOutputTransformer,
} = require("../transformers/");
const {body, validationResult} = require('express-validator');
const {SALE, AUCTION} = require("../constants/PurchaseTypes")
const { PRIMARY, SECONDARY } = require("../constants/MarketTypes");
const Web3Helper = require("./../utils/Web3Helper");
const Web3Service = require("../services/web3.service");
const fillerService = require("../services/filler.service");
const marketClerkABI = require("../abis/v3/marketClerkABI.json");
const seenV3NFTABI = require("../abis/v3/seenHausNFTABI.json");
const auctionBuilderABI = require("../abis/v3/auctionBuilderABI.json");
const saleBuilderABI = require("../abis/v3/saleBuilderABI.json");
const CollectableOutputTransformer = require("../transformers/collectable/output");
const StringHelper = require("./../utils/StringHelper")
const { 
    networkNameToMarketDiamond,
    networkNameToSeenNFT,
} = require('../constants/ContractAddressesV3');
const {
    getSeenHausV3NFTMetadata,
    getSeenHausV3NFTTangibility,
} = require('../utils/SeenV3NFTHelper');

const generateCollectableSlug = async (name = false) => {
    if(name) {
        let slug = StringHelper.slugify(name);
        console.log({slug});
        let data = await CollectableRepository
            .setTransformer(CollectableOutputTransformer)
            .findBySlug(slug);
        if(!data) {
            return slug;
        } else {
            return StringHelper.slugify(`${slug} ${new Date().getTime() / 1000}`);
        }
    }
}
class CollectableController extends Controller {

    async index(req, res) {
        const pagination = this.extractPagination(req);
        const type = req.query.type;
        const purchaseType = req.query.purchaseType;
        const artistId = req.query.artistId;
        const userId = req.query.userId;
        const includeIsHiddenFromDropList = req.query.includeIsHiddenFromDropList;
        const bundleChildId = req.query.bundleChildId;
        const collectionName = req.query.collectionName;
        const excludeEnded = req.query.excludeEnded;
        const excludeLive = req.query.excludeLive;
        const excludeComingSoon = req.query.excludeComingSoon;
        const data = await CollectableRepository
            .setTransformer(CollectableOutputTransformer)
            .paginate(pagination.perPage, pagination.page, {type, purchaseType, artistId, includeIsHiddenFromDropList, bundleChildId, collectionName, excludeEnded, excludeLive, excludeComingSoon, userId});

        this.sendResponse(res, data);
    }

    async show(req, res) {
        const contractAddress = req.params.contractAddress;

        let data = await CollectableRepository
                .setTransformer(CollectableOutputTransformer)
                .findBySlug(contractAddress);

        if (!data) {
             data = await CollectableRepository
                .setTransformer(CollectableOutputTransformer)
                .findByContractAddress(contractAddress);

        }

        if (!data) {
            data = await CollectableRepository
                .setTransformer(CollectableOutputTransformer)
                .findById(contractAddress);
        }

        this.sendResponse(res, data);
    }

    async hero(req, res) {

        let data = await FeaturedDropRepository
                .setTransformer(CollectableOutputTransformer)
                .findHeroCollectable();

        this.sendResponse(res, data);
    }

    async showSecondary(req, res) {
        const slug = req.params.slug;

        let data = await SecondaryMarketListingRepository
            .setTransformer(SecondaryMarketListingOutputTransformer)
            .findBySlug(slug);

        this.sendResponse(res, data);
    }

    async map(req, res) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const {
            tokenIds,
        } = req.body;

        const data = await CollectableRepository
            .setTransformer(CollectableOutputTransformer)
            .queryByTokenIds(tokenIds.map(t => parseInt(t)));

        this.sendResponse(res, data);
    }

    async mapWithTokenContractAddress(req, res) {
        const errors = validationResult(req);

        console.log({' errors.array()':  errors.array()})

        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const {
            tokenContractAddressesToIds,
        } = req.body;
        
        // ensure any possible duplicates are removed, as duplicates can arise from combining multiTokenFragment with dataFragment
        let consolidatedData = [];
        let idTracker = [];

        for(let [tokenContractAddress, tokenIds] of Object.entries(tokenContractAddressesToIds)) {

            let parsedTokenIds = tokenIds.map(t => parseInt(t));

            let dataFragment = await CollectableRepository
                .setTransformer(CollectableOutputTransformer)
                .queryByTokenContractAddressWithTokenIds(tokenContractAddress, parsedTokenIds);

            let matchedIds = dataFragment.map(item => parseInt(item.nft_token_id));
            let unmatchedIds = parsedTokenIds.filter(item => matchedIds.indexOf(item) == -1);

            let multiTokenFragment = [];
            if(unmatchedIds.length > 0) {
                // Check for multitoken drop matches, e.g. where nft_token_id is a set (e.g. 1,2,3,4) instead of just one value
                let multiTokenFragmentRaw = await CollectableRepository
                    .setTransformer(CollectableOutputTransformer)
                    .queryByTokenContractAddressWithMultiTokenIds(tokenContractAddress, unmatchedIds);

                if(multiTokenFragmentRaw.length > 0) {
                    multiTokenFragment = multiTokenFragmentRaw;
                }
            }


            let data = [...consolidatedData, ...dataFragment, ...multiTokenFragment];

            for(let item of data) {
                if(idTracker.indexOf(item.id) === -1) {
                    consolidatedData.push(item);
                    idTracker.push(item.id);
                }
            }
        }

        this.sendResponse(res, consolidatedData);
    }

    async winner(req, res) {

        const contractAddress = req.params.contractAddress;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const {
            wallet_address,
            email,
            first_name,
            last_name,
            address,
            city,
            zip,
            province,
            country,
            telegram_username,
            phone,
            sig
        } = req.body;

        let collectable = await CollectableRepository.findByWinnerAddress(contractAddress, wallet_address)
        if (!collectable) {
            return this.sendResponse(res, {errors: errors.array()}, "Not found", 400);
        }

        const signAddress = wallet_address.toLowerCase();
        const msg = `I would like to save my shipping information for wallet address ${signAddress}.`;
        try {
            let isValidSignature = await Web3Helper.verifySignature(msg, sig, wallet_address);
            if (!isValidSignature) {
                this.sendError(res, "Signature is not valid");
                return;
            }
        } catch (e) {
            this.sendError(res, "Signature is not valid");
            return;
        }

        await CollectableWinnerRepository.create({
            wallet_address,
            email,
            first_name,
            last_name,
            address,
            city,
            zip,
            country,
            province,
            collectable_id: collectable.id,
            telegram_username,
            phone
        })

        this.sendResponse(res, []);
    }

    async publishCollectableFromConsignmentId(req, res) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const {
            consignment_id
        } = req.body;

        const consignmentId = consignment_id;

        // Check if collectable with consignment ID already exists, else create new collectable with consignment ID
        let collectableWithConsignmentId = await CollectableRepository
            .setTransformer(CollectableOutputTransformer)
            .findByConsignmentId(consignmentId);

        console.log({collectableWithConsignmentId})

        if(!collectableWithConsignmentId) {

            // Check that there isn't an existing secondary listing with this consignment ID
            let existingSecondaryListingWithConsignmentId = await SecondaryMarketListingRepository
                .setTransformer(SecondaryMarketListingOutputTransformer)
                .findByConsignmentId(consignmentId);

            if(existingSecondaryListingWithConsignmentId) {
                this.sendResponse(res, existingSecondaryListingWithConsignmentId);
                return;
            }

            const useNetwork = process.env.ETH_NETWORK ? process.env.ETH_NETWORK : "mainnet";

            const marketClerkContractService = new Web3Service(networkNameToMarketDiamond[useNetwork], marketClerkABI);
            
            let consignment;

            try {
                consignment = await marketClerkContractService.getConsignment(consignmentId);
            } catch (e) {
                console.log({e})
                this.sendError(res, 'Consignment can not be found');
                return;
            }

            console.log({consignment})

            if(consignment) {
                let collectable;
                let secondaryMarketListing;
                let tokenMetadata = await getSeenHausV3NFTMetadata(consignment.tokenId);
                console.log({tokenMetadata})
                // TODO: Validate metadata
                let tangibility = await getSeenHausV3NFTTangibility(consignment.tokenId);
                let slug = await generateCollectableSlug(tokenMetadata.name);
                console.log({tokenMetadata, tangibility, slug})

                let user = await UserRepository
                        .setTransformer(UserOutputTransformer)
                        .findByAddress(consignment.seller);

                if (!user) {
                    let data = {
                        wallet: consignment.seller,
                    }
                    user = await UserRepository
                        .create(UserTransformer.transform(data))
                }
                if(consignment.marketHandler === '0') {
                    this.sendError(res, "Consignment has not been assigned to a market handler");
                } else if(consignment.marketHandler === AUCTION.toString()) {
                    // Get auction
                    const auctionBuilderContractService = new Web3Service(networkNameToMarketDiamond[useNetwork], auctionBuilderABI);
                    let auction;
                    try {
                        auction = await auctionBuilderContractService.getAuction(consignmentId);
                    } catch (e) {
                        console.log({e})
                        this.sendError(res, 'Auction can not be found');
                        return;
                    }
                    if(auction) {
                        console.log({auction})

                        if(consignment.market === PRIMARY) {

                            let collectablePayload = {
                                title: tokenMetadata.name,
                                slug,
                                type: tangibility,
                                purchase_type: AUCTION,
                                category: 'regular',
                                description: tokenMetadata.description,
                                edition: consignment.supply,
                                edition_of: consignment.supply,
                                contract_address: networkNameToMarketDiamond[useNetwork],
                                is_active: 1,
                                is_sold_out: 0,
                                starts_at: auction.start * 1000,
                                ...(auction.state > 0 && { ends_at: (Number(auction.start) + Number(auction.duration)) * 1000 }),
                                start_bid: ethers.utils.formatEther(auction.reserve),
                                min_bid: ethers.utils.formatEther(auction.reserve),
                                version: 3,
                                nft_contract_address: consignment.tokenAddress,
                                nft_token_id: consignment.tokenId,
                                is_reserve_price_auction: auction.clock === '1' ? true : false,
                                auto_generate_claim_page: tangibility === 'tangible-nft' ? true : false,
                                user_id: user.id,
                                consignment_id: consignment.id,
                                market_type: consignment.market,
                                market_handler_type: consignment.marketHandler,
                                clock_type: auction.clock,
                                state: auction.state,
                                outcome: auction.outcome,
                                multi_token: consignment.multiToken,
                                released: consignment.released,
                                ...(tokenMetadata.rights && { rights: tokenMetadata.rights }),
                                ...(tokenMetadata.attributes && { attributes: JSON.stringify(tokenMetadata.attributes) }),
                            }

                            collectable = await CollectableRepository
                                .setTransformer(CollectableAuctionTransformer)
                                .create(CollectableAuctionTransformer.transform(collectablePayload));

                        } else if (consignment.market === SECONDARY) {
                            console.log("IS SECONDARY")

                            // Check if there is a primary collectable associated with this secondary listing
                            let primaryCollectable = await CollectableRepository.queryByTokenContractAddressWithTokenId(consignment.tokenAddress, consignment.tokenId);

                            console.log({primaryCollectable, 'primaryCollectable.id': primaryCollectable.id})
                            
                            let secondaryMarketListingPayload = {
                                collectable_id: primaryCollectable.id,
                                slug,
                                purchase_type: AUCTION,
                                edition: consignment.supply,
                                edition_of: consignment.supply,
                                contract_address: networkNameToMarketDiamond[useNetwork],
                                is_active: 1,
                                is_sold_out: 0,
                                starts_at: auction.start * 1000,
                                ...(auction.state > 0 && { ends_at: (Number(auction.start) + Number(auction.duration)) * 1000 }),
                                start_bid: ethers.utils.formatEther(auction.reserve),
                                min_bid: ethers.utils.formatEther(auction.reserve),
                                version: 3,
                                is_reserve_price_auction: auction.clock === '1' ? true : false,
                                user_id: user.id,
                                consignment_id: consignment.id,
                                market_type: consignment.market,
                                market_handler_type: consignment.marketHandler,
                                clock_type: auction.clock,
                                state: auction.state,
                                outcome: auction.outcome,
                                multi_token: consignment.multiToken,
                                released: consignment.released,
                            }

                            secondaryMarketListing = await SecondaryMarketListingRepository
                                .setTransformer(SecondaryMarketListingAuctionTransformer)
                                .create(SecondaryMarketListingAuctionTransformer.transform(secondaryMarketListingPayload));
                        }
                        
                    }
                } else if (consignment.marketHandler === SALE.toString()) {
                    // Get sale
                    const saleBuilderContractService = new Web3Service(networkNameToMarketDiamond[useNetwork], saleBuilderABI);
                    let sale;
                    try {
                        sale = await saleBuilderContractService.getSale(consignmentId);
                    } catch (e) {
                        console.log({e})
                        this.sendError(res, 'Sale can not be found');
                        return;
                    }
                    if(sale) {
                        console.log({sale})

                        if(consignment.market === PRIMARY) {

                            let collectablePayload = {
                                title: tokenMetadata.name,
                                slug,
                                type: tangibility,
                                purchase_type: SALE,
                                category: 'regular',
                                description: tokenMetadata.description,
                                available_qty: consignment.supply,
                                edition: consignment.supply,
                                edition_of: consignment.supply,
                                contract_address: networkNameToMarketDiamond[useNetwork],
                                is_active: 1,
                                is_sold_out: 0,
                                starts_at: sale.start * 1000,
                                ends_at: ((parseInt(sale.start) + (60 * 60 * 24 * 31)) * 1000), // Sets ends_at date to 31 days after start, on chain there is no end date
                                price: ethers.utils.formatEther(sale.price),
                                version: 3,
                                nft_contract_address: consignment.tokenAddress,
                                nft_token_id: consignment.tokenId,
                                auto_generate_claim_page: tangibility === 'tangible-nft' ? true : false,
                                user_id: user.id,
                                consignment_id: consignment.id,
                                market_type: consignment.market,
                                market_handler_type: consignment.marketHandler,
                                state: sale.state,
                                outcome: sale.outcome,
                                multi_token: consignment.multiToken,
                                released: consignment.released,
                                ...(tokenMetadata.rights && { rights: tokenMetadata.rights }),
                                ...(tokenMetadata.attributes && { attributes: JSON.stringify(tokenMetadata.attributes) }),
                            }

                            collectable = await CollectableRepository
                                .setTransformer(CollectableSaleTangibleTransformer)
                                .create(CollectableSaleTangibleTransformer.transform(collectablePayload));

                        } else if (consignment.market === SECONDARY) {

                            // Check if there is a primary collectable associated with this secondary listing
                            let primaryCollectable = await CollectableRepository.queryByTokenContractAddressWithTokenId(consignment.tokenAddress, consignment.tokenId);

                            console.log({primaryCollectable, 'primaryCollectable.id': primaryCollectable.id})

                            let secondaryMarketListingPayload = {
                                collectable_id: primaryCollectable.id,
                                slug,
                                purchase_type: SALE,
                                available_qty: consignment.supply,
                                edition: consignment.supply,
                                edition_of: consignment.supply,
                                contract_address: networkNameToMarketDiamond[useNetwork],
                                is_active: 1,
                                is_sold_out: 0,
                                starts_at: sale.start * 1000,
                                ends_at: ((parseInt(sale.start) + (60 * 60 * 24 * 31)) * 1000), // Sets ends_at date to 31 days after start, on chain there is no end date
                                price: ethers.utils.formatEther(sale.price),
                                version: 3,
                                user_id: user.id,
                                consignment_id: consignment.id,
                                market_type: consignment.market,
                                market_handler_type: consignment.marketHandler,
                                state: sale.state,
                                outcome: sale.outcome,
                                multi_token: consignment.multiToken,
                                released: consignment.released,
                            }

                            secondaryMarketListing = await SecondaryMarketListingRepository
                                .setTransformer(SecondaryMarketListingSaleTransformer)
                                .create(SecondaryMarketListingSaleTransformer.transform(secondaryMarketListingPayload));

                        }

                    }
                }

                if(collectable) {

                    // Fetch media record in ipfs_media table
                    let mediaIpfsHash = tokenMetadata.image.split('ipfs://')[1];
                    let mediaRecord = await IPFSMediaRepository.findByColumn('ipfs_hash', mediaIpfsHash);

                    console.log({collectable})

                    // handle tag creation/association

                    if(tokenMetadata.tags) {
                        for(let tag of tokenMetadata.tags) {
                            let useTag = tag.toLowerCase();
                            // Check if tag exists, else create it
                            let tagRecord = await TagRepository.findByColumn('name', useTag);
                            if(!tagRecord) {
                                tagRecord = await TagRepository.create({name: useTag});
                            }

                            // Associate tag with collectable
                            await TagToCollectableRepository.create({
                                collectable_id: collectable.id,
                                tag_id: tagRecord.id
                            });
                        }
                    }

                    await MediaRepository.create({
                        collectable_id: collectable.id,
                        url: `https://seenhaus.mypinata.cloud/ipfs/${mediaIpfsHash}`,
                        origin_url: `https://seenhaus.mypinata.cloud/ipfs/${mediaIpfsHash}`,
                        type: mediaRecord.mime_type,
                        path: `https://seenhaus.mypinata.cloud/ipfs/${mediaIpfsHash}`,
                        position: 1,
                        is_preview: 1,
                    })

                    await MediaRepository.create({ 
                        collectable_id: collectable.id,
                        url: `https://seenhaus.mypinata.cloud/ipfs/${mediaIpfsHash}`,
                        origin_url: `https://seenhaus.mypinata.cloud/ipfs/${mediaIpfsHash}`,
                        type: mediaRecord.mime_type,
                        path: `https://seenhaus.mypinata.cloud/ipfs/${mediaIpfsHash}`,
                        position: 1,
                        is_preview: 0,
                    })

                    const createdCollectable = await CollectableRepository
                        .setTransformer(CollectableOutputTransformer)
                        .findById(collectable.id);

                    console.log({createdCollectable})

                    this.sendResponse(res, createdCollectable);
                } else if (secondaryMarketListing) {

                    const createdSecondaryMarketListing = await SecondaryMarketListingRepository
                        .setTransformer(SecondaryMarketListingOutputTransformer)
                        .findById(secondaryMarketListing.id);

                    console.log({createdSecondaryMarketListing})

                    this.sendResponse(res, createdSecondaryMarketListing);
                    return;
                } else {
                    this.sendError(res, "Collectable Payload Generation Error");
                }

            } else {
                this.sendError(res, consignmentFetchError);
            }

        } else {
            this.sendResponse(res, collectableWithConsignmentId);
        }

    }
}

module.exports = CollectableController;
