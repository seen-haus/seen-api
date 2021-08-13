const Knex = require("knex");
const {dbConfig} = require("./../config");
const {AUCTION, SALE} = require("./../constants/PurchaseTypes");
const {V1, V2} = require("./../constants/Versions");
const {Model} = require("objection");
const {CollectableRepository, UserEmailPreferencesRepository, EventRepository, ClaimRepository, UserRepository} = require("./../repositories/index");
const {CollectableOutputTransformer, UserEmailPreferencesOutputTransformer} = require("./../transformers");
const filler = require('./../services/filler.service')
const Web3Service = require('./../services/web3.service')
const { sendClaimPageNotification } = require('./../services/sendgrid.service');
const NFTV1Abi = require("../abis/v1/NFTSale.json");
const NFTV2OpenEdition = require("../abis/v2/OpenEdition.json");
const AuctionV1Abi = require("../abis/v1/EnglishAuction.json");
const AuctionV2Abi = require("../abis/v2/EnglishAuction.json");
const ethers = require('ethers');

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

/**
 * Fills events, checkes if sale is sold out, auction is over.
 * @return {Promise<void>}
 */
const run = async() => {
    const collectables = await getActiveCollectables();
    for (const collectable of collectables) {
        // Fill Events
        await filler.fillEvents(collectable);
        switch (collectable.purchase_type) {
            case SALE:
                if (collectable.is_open_edition !== 1) {
                    await checkIfSoldOut(collectable);
                } else {
                    await checkIfOpenEditionHasClosed(collectable);
                }
                break;
            case AUCTION:
                if (collectable.version == V1) {
                    console.log("AUCTION V1")
                    await checkIfAuctionIsOver(collectable);
                } else {
                    console.log("AUCTION V2")
                    await checkIfAuctionV2IsOver(collectable);
                }
                break;
        }
    }
    console.log("FALLBACK SUCCESSFULLY RAN")
    process.exit();
}

run();
