const Knex = require("knex");
const ethers = require('ethers');
const {Model} = require("objection");

const {dbConfig} = require("./../config");
const {AUCTION, SALE} = require("./../constants/PurchaseTypes");
const {PRIMARY, SECONDARY} = require("./../constants/MarketTypes");
const {V1, V2, V3} = require("./../constants/Versions");
const {
    CollectableRepository,
    SecondaryMarketListingRepository,
    UserEmailPreferencesRepository,
    EventRepository,
    ClaimRepository,
    UserRepository,
    EthPriceCacheRepository,
} = require("./../repositories/index");
const {CollectableOutputTransformer, UserEmailPreferencesOutputTransformer} = require("./../transformers");
const filler = require('./../services/filler.service')
const CoinpaprikaService = require('./../services/coinpaprika.service');
const Web3Service = require('./../services/web3.service')
const { sendClaimPageNotification } = require('./../services/sendgrid.service');
const NFTV1Abi = require("../abis/v1/NFTSale.json");
const NFTV2OpenEdition = require("../abis/v2/OpenEdition.json");
const VRFSaleAbi = require("../abis/v2/VRFSale.json");
const AuctionV1Abi = require("../abis/v1/EnglishAuction.json");
const AuctionV2Abi = require("../abis/v2/EnglishAuction.json");
const AuctionV3Abi = require("../abis/v3/auctionBuilderABI.json");
const SaleV3Abi = require("../abis/v3/saleBuilderABI.json");
const nftV3Abi = require("../abis/v3/seenHausNFTABI.json");
const MarketClerkABI = require("../abis/v3/marketClerkABI.json");
const MarketConfigABI = require("../abis/v3/marketConfigABI.json");
const TicketerABI = require("../abis/v3/ticketerABI.json");
const { sleep } = require('../utils/MiscHelpers');
const { 
    networkNameToSeenNFT,
    networkNameToMarketDiamond,
} = require('../constants/ContractAddressesV3');

// const

// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

const getActiveCollectables = async () => {
    let collectables = await CollectableRepository.active();
    return collectables.filter(collectable => (collectable.purchase_type === SALE
        ? (!collectable.is_sold_out && !collectable.is_closed)
        : !collectable.winner_address)
        && collectable.contract_address
        && ethers.utils.isAddress(collectable.contract_address));
}

const getActiveSecondaryListings = async () => {
    let collectables = await SecondaryMarketListingRepository.active();
    return collectables.filter(collectable => (collectable.purchase_type === SALE
        ? (!collectable.is_sold_out && !collectable.is_closed)
        : !collectable.winner_address)
        && collectable.contract_address
        && ethers.utils.isAddress(collectable.contract_address));
}

const checkIfSoldOut = async (collectable) => {
    let service = new Web3Service(collectable.contract_address, NFTV1Abi);
    let isSoldOut = await service.isSoldOut();
    if (isSoldOut) {
        await CollectableRepository.update({is_sold_out: 1}, collectable.id);
    }
    return true
};

const checkIfOpenEditionHasClosed = async (collectable) => {
    let service = new Web3Service(collectable.contract_address, NFTV2OpenEdition);
    let isClosed = await service.isOpenEditionClosed();
    if (isClosed) {
        await CollectableRepository.update({is_sold_out: 1}, collectable.id);
    }
    return true
}

const checkIfSaleV3IsSoldOut = async (collectable) => {
    const useNetwork = process.env.ETH_NETWORK ? process.env.ETH_NETWORK : "mainnet";
    const serviceSaleBuilderContract = new Web3Service(collectable.contract_address, SaleV3Abi);
    const serviceMarketClerkContract = new Web3Service(networkNameToMarketDiamond[useNetwork], MarketClerkABI);
    const consignment = await serviceMarketClerkContract.getConsignment(collectable.consignment_id);
    let isPhysical, ticketClaimsIssued = false;
    if(consignment.market === PRIMARY) {
        const serviceNFTContract = new Web3Service(collectable.nft_contract_address, nftV3Abi);
        isPhysical = serviceNFTContract.isPhysical && await serviceNFTContract.isPhysical(consignment.tokenId);
        if(isPhysical) {
            const serviceMarketConfigContract = new Web3Service(networkNameToMarketDiamond[useNetwork], MarketConfigABI);
            const ticketerAddress = await serviceMarketConfigContract.getEscrowTicketer(consignment.id);

            console.log({ticketerAddress})
            
            const serviceTicketerContract = new Web3Service(ticketerAddress, TicketerABI);

            ticketClaimsIssued = await serviceTicketerContract.getTicketClaimableCount(consignment.id);
        }
    }
    let isSoldOut = await serviceSaleBuilderContract.isSaleOverV3(collectable.consignment_id, consignment, isPhysical, ticketClaimsIssued);
    if (isSoldOut) {
        if(collectable.market_type === 1) {
            // is secondary listing
            await SecondaryMarketListingRepository.update({is_sold_out: 1, is_closed: 1}, collectable.id);
        } else {
            await CollectableRepository.update({is_sold_out: 1, is_closed: 1}, collectable.id);
        }
    }
    return true
};

const checkIfVrfDropHasClosed = async (collectable) => {
    let service = new Web3Service(collectable.contract_address, VRFSaleAbi);
    let isClosed = await service.isReservationPeriodOver();
    if (isClosed) {
        await CollectableRepository.update({is_sold_out: 1, is_closed: 1}, collectable.id);
    }
    return true
}

const checkIfAuctionIsOver = async (collectable) => {
    const service = new Web3Service(collectable.contract_address, AuctionV1Abi);
    let isOver = await service.isAuctionOver();
    if (isOver) {
        const winnerAddress = await service.getWinningAddress();
        if (!winnerAddress) {
            return true;
        }
        await CollectableRepository.update({
            is_sold_out: 1,
            winner_address: winnerAddress
        }, collectable.id);
        if(collectable.auto_generate_claim_page) {
            await ClaimRepository.create({
                collectable_id: collectable.id,
                is_active: 1,
            });
        }
    }
    return true;
};

const checkIfAuctionV2IsOver = async (collectable) => {
    console.log("CALLED")
    const service = new Web3Service(collectable.contract_address, AuctionV2Abi);
    let isOver = await service.isAuctionOverV2();
    if (isOver) {
        const winnerAddress = await service.getWinningAddress();
        if (!winnerAddress) {
            return true;
        }
        await CollectableRepository.update({
            is_sold_out: 1,
            winner_address: winnerAddress
        }, collectable.id);
        if(collectable.auto_generate_claim_page) {
            let createdClaim = await ClaimRepository.create({
                collectable_id: collectable.id,
                is_active: 1,
            });
            console.log({createdClaim})
            let createdClaimId = createdClaim.id;
            if(!isNaN(createdClaimId)) {
                let preferencesAllowNotification = false;

                // First check if we have an email address for the winnerAddress, and if their notification preferences enable outbid notifications
                let emailAddress = await UserRepository.findEmailByAddress(winnerAddress);

                if(emailAddress) {
                    let user = await UserRepository.findByAddress(winnerAddress);
                    // Check notification preferences
                    let preferences = await UserEmailPreferencesRepository
                        .setTransformer(UserEmailPreferencesOutputTransformer)
                        .findPreferencesByUserId(user.id);

                    if(preferences && !preferences.global_disable && preferences.claim_page_go_live) {
                        preferencesAllowNotification = true;
                    }
                }

                // Provided the following, we can send the notification
                if(preferencesAllowNotification) {
                    const collectableWithMedia = await CollectableRepository.setTransformer(CollectableOutputTransformer).findById(collectable.id);
                    let collectableImage = false;
                    if(collectable.media && collectable.media.length > 0) {
                        let sortedMedia = [...collectable.media].sort((a, b) => a.position - b.position);
                        for(let media of sortedMedia) {
                            if(media.type && (media.type === 'image/jpeg') || (media.type === 'image/png')) {
                                collectableImage = media.url ? media.url : false;
                                // Use first image
                                break;
                            }
                        }
                    }
                    let collectableTitle = collectable.title;
                    let slug = collectable.slug;
                    let claimLink = collectable.is_slug_full_route ? `https://seen.haus/${slug}` : `https://seen.haus/drops/${slug}`
                    await sendClaimPageNotification(emailAddress, claimLink, collectableTitle, collectableImage);
                }
            }
            // await sendMail(['jay@society0x.org', 'thealchemicalopus@gmail.com'], `New Claim - Test Title`, `A new claim has been submitted on Test Title`, `<p>A new claim has been submitted on <strong>Test Title</strong></p>`);
        }
    }
    return true;
};

const checkIfAuctionV3IsOver = async (collectable) => { // Move to a different file so that it can be imported by watchers/v3/CollectableAuction
    console.log("CALLED V3")
    const service = new Web3Service(collectable.contract_address, AuctionV3Abi);
    console.log("Check isOver")
    let isOver = await service.isAuctionOverV3(collectable.consignment_id);
    console.log({isOver})
    if (isOver) {
        const winnerAddress = await service.getWinningAddressAuctionV3(collectable.consignment_id);
        console.log({winnerAddress})
        if (!winnerAddress) {
            return true;
        }
        if(collectable.market_type === 1) {
            // is secondary listing
            await SecondaryMarketListingRepository.update({
                is_sold_out: 1,
                winner_address: winnerAddress,
                is_closed: 1,
            }, collectable.id);
        } else {
            await CollectableRepository.update({
                is_sold_out: 1,
                winner_address: winnerAddress,
                is_closed: 1,
            }, collectable.id);
        }
        if(collectable.auto_generate_claim_page) {
            let createdClaim = await ClaimRepository.create({
                collectable_id: collectable.id,
                is_active: 1,
            });
            console.log({createdClaim})
            let createdClaimId = createdClaim.id;
            if(!isNaN(createdClaimId)) {
                let preferencesAllowNotification = false;

                // First check if we have an email address for the winnerAddress, and if their notification preferences enable claim page notifications
                let emailAddress = await UserRepository.findEmailByAddress(winnerAddress);

                if(emailAddress) {
                    let user = await UserRepository.findByAddress(winnerAddress);
                    // Check notification preferences
                    let preferences = await UserEmailPreferencesRepository
                        .setTransformer(UserEmailPreferencesOutputTransformer)
                        .findPreferencesByUserId(user.id);

                    if(preferences && !preferences.global_disable && preferences.claim_page_go_live) {
                        preferencesAllowNotification = true;
                    }
                }

                // Provided the following, we can send the notification
                if(preferencesAllowNotification) {
                    const collectableWithMedia = await CollectableRepository.setTransformer(CollectableOutputTransformer).findById(collectable.id);
                    let collectableImage = false;
                    if(collectableWithMedia.media && collectableWithMedia.media.length > 0) {
                        let sortedMedia = [...collectableWithMedia.media].sort((a, b) => a.position - b.position);
                        for(let media of sortedMedia) {
                            if(media.type && (media.type === 'image/jpeg') || (media.type === 'image/png')) {
                                collectableImage = media.url ? media.url : false;
                                // Use first image
                                break;
                            }
                        }
                    }
                    let collectableTitle = collectable.title;
                    let slug = collectable.slug;
                    let claimLink = collectable.is_slug_full_route ? `https://seen.haus/${slug}` : `https://seen.haus/drops/${slug}`
                    await sendClaimPageNotification(emailAddress, claimLink, collectableTitle, collectableImage);
                }
            }
            // await sendMail(['jay@society0x.org', 'thealchemicalopus@gmail.com'], `New Claim - Test Title`, `A new claim has been submitted on Test Title`, `<p>A new claim has been submitted on <strong>Test Title</strong></p>`);
        }
    }
    return true;
};

/**
 * Fills events, checkes if sale is sold out, auction is over.
 * @return {Promise<void>}
 */
const run = async() => {
    const collectables = await getActiveCollectables();
    const secondaryListings = await getActiveSecondaryListings();

    const allActiveListings = [...collectables, ...secondaryListings];

    // We need to be careful of making batches large because if there is a single consignment with a lot of unindexed events on it
    // it can cause the ETH -> USD conversion services to hit their rate limit
    const batchSize = 30;

    try {

        const fillEventFunctionBatches = [];
        for (const [index, collectable] of allActiveListings.entries()) {
            // Fill Events
            // await filler.fillEvents(collectable);
            let batchIndex = Math.floor(index/batchSize);
            if(!fillEventFunctionBatches[batchIndex]) {
                // If there is a previous batch, ensure it is done first
                if((batchIndex > 0) && fillEventFunctionBatches[batchIndex - 1]) {
                    await Promise.all(fillEventFunctionBatches[batchIndex - 1]);
                }
                // We sleep here because the functions are technically called when we add them into a batch
                // So if we want to prevent all batches firing at once, we need to add a delay to when we add the function to the batches
                await sleep(1500);
                fillEventFunctionBatches[batchIndex] = [filler.fillEvents(collectable)];
            } else {
                fillEventFunctionBatches[batchIndex].push(filler.fillEvents(collectable));
            }
        }
        // Await the final batch
        if(fillEventFunctionBatches.length > 0) {
            await Promise.all(fillEventFunctionBatches[fillEventFunctionBatches.length - 1]);
        }

        const checkOverFunctionBatches = [];
        for(const [index, collectable] of allActiveListings.entries()) {
            let batchFunction;
            switch (collectable.purchase_type) {
                case SALE:
                    if (collectable.version == V3) {
                        batchFunction = checkIfSaleV3IsSoldOut(collectable);
                    } else if (collectable.version == V2 || collectable.version == V1) {
                        if (collectable.is_open_edition) {
                            await checkIfOpenEditionHasClosed(collectable);
                        } else if(collectable.is_vrf_drop) {
                            await checkIfVrfDropHasClosed(collectable);
                        } else {
                            await checkIfSoldOut(collectable);
                        }
                    }
                    break;
                case AUCTION:
                    if (collectable.version == V3) {
                        console.log("AUCTION V3")
                        batchFunction = checkIfAuctionV3IsOver(collectable);
                    } else if (collectable.version == V2) {
                        console.log("AUCTION V2")
                        batchFunction = checkIfAuctionV2IsOver(collectable);
                    } else if (collectable.version == V1) {
                        console.log("AUCTION V1")
                        batchFunction = checkIfAuctionIsOver(collectable);
                    }
                    break;
            }
            let batchIndex = Math.floor(index/batchSize);
            if(!checkOverFunctionBatches[batchIndex]) {
                // If there is a previous batch, ensure it is done first
                if((batchIndex > 0) && checkOverFunctionBatches[batchIndex - 1]) {
                    await Promise.all(checkOverFunctionBatches[batchIndex - 1]);
                }
                // We sleep here because the functions are technically called when we add them into a batch
                // So if we want to prevent all batches firing at once, we need to add a delay to when we add the function to the batches
                await sleep(1500);
                checkOverFunctionBatches[batchIndex] = [batchFunction];
            } else {
                checkOverFunctionBatches[batchIndex].push(batchFunction);
            }
        }
        // Await the final batch
        if(checkOverFunctionBatches.length > 0) {
            await Promise.all(checkOverFunctionBatches[checkOverFunctionBatches.length - 1]);
        }

        console.log("FALLBACK SUCCESSFULLY RAN")
    } catch (e) {
        console.log(e);
    }
    process.exit();
}

run();

module.exports = {
    checkIfAuctionV3IsOver
}