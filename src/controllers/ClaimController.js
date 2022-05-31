const Controller = require("./Controller");
const Web3Service = require("../services/web3.service");
const seenNFTABI = require("../abis/seennftabi.json");
const MarketConfigABI = require("../abis/v3/marketConfigABI.json");
const {
  ClaimRepository,
  CollectableRepository,
  CollectableWinnerRepository,
  EligibleClaimantRepository,
  TicketCacheRepository,
} = require("./../repositories");
const CollectableOutputTransformer = require("../transformers/collectable/output");
const TicketCacheOutputTransformer = require("../transformers/ticket_cache/output");
const { claimAdminEmailAddresses } = require('./../constants/Email')
const { validationResult } = require("express-validator");
const Web3Helper = require("./../utils/Web3Helper");
const ClaimOutputTransformer = require("../transformers/claim/output");
const { sendMail } = require('../services/sendgrid.service.js');
const { 
  networkNameToMarketDiamond,
} = require('../constants/ContractAddressesV3');

class ClaimController extends Controller {
  async show(req, res) {
    const contractAddress = req.params.contractAddress;
    let data = await ClaimRepository.setTransformer(
      ClaimOutputTransformer
    ).findByContractAddress(contractAddress);

    if (!data) {
      data = await ClaimRepository.setTransformer(
        ClaimOutputTransformer
      ).findById(contractAddress);
    }

    this.sendResponse(res, data);
  }

  async claim(req, res) {
    const contractAddress = req.params.contractAddress;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return this.sendResponse(
        res,
        { errors: errors.array() },
        "Validation error",
        422
      );
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
      sig,
      message,
    } = req.body;

    let collectable = await CollectableRepository.setTransformer(CollectableOutputTransformer).findByContractAddress(contractAddress);
    let hasBalance = false;
    let nftContractService = new Web3Service(collectable.nft_contract_address, seenNFTABI); //EIP-1155
    let balanceOfClaimer = 0;

    if(Array.isArray(collectable.nft_token_id) || collectable.is_vrf_drop) {
      for(let tokenId of collectable.nft_token_id) {
        let tokenBalanceCurrentId = await nftContractService.balanceOf(wallet_address, tokenId);
        balanceOfClaimer += parseInt(tokenBalanceCurrentId);
      }
    } else {
      balanceOfClaimer = await nftContractService.balanceOf(wallet_address, collectable.nft_token_id);
    }
    
    if(parseInt(balanceOfClaimer) > 0) {
      hasBalance = true;
    }
    
    if (!hasBalance) {
      return this.sendResponse(
        res,
        { errors: errors.array() },
        "Not found",
        403
      );
    }

    const signAddress = wallet_address.toLowerCase();
    const msg = `I would like to save my shipping information for wallet address ${signAddress}.`;
    try {
      let isValidSignature = await Web3Helper.verifySignature(
        msg,
        sig,
        wallet_address
      );
      if (!isValidSignature) {
        this.sendError(res, "Signature is not valid");
        return;
      }
    } catch (e) {
      this.sendError(res, "Signature is not valid");
      return;
    }

    try {
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
        phone,
        message,
      });
  
      this.sendResponse(res, []);

      try {
        if(claimAdminEmailAddresses && claimAdminEmailAddresses.length > 0) {
          sendMail(claimAdminEmailAddresses, `New Claim - ${collectable.title}`, `A new claim has been submitted on ${collectable.title}`, `<p>A new claim has been submitted on <strong>${collectable.title}</strong></p>`);
        }
      } catch(e) {
        console.error({e})
      }

    } catch (e) {
      console.log(e)
      this.sendError(res, "You have already submitted a claim, please contact the team if you need to amend details.");
    }
    
  }

  async claimV3(req, res) {
    const claimId = req.params.claimId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return this.sendResponse(
        res,
        { errors: errors.array() },
        "Validation error",
        422
      );
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
      sig,
      message,
    } = req.body;

    const claimWithCollectable = await ClaimRepository.findById(claimId);

    if(claimWithCollectable && claimWithCollectable.collectable && claimWithCollectable.collectable.consignment_id) {

      let { collectable } = claimWithCollectable;

      const useNetwork = process.env.ETH_NETWORK ? process.env.ETH_NETWORK : "mainnet";
      const serviceMarketConfigContract = new Web3Service(networkNameToMarketDiamond[useNetwork], MarketConfigABI);
      const ticketerAddress = await serviceMarketConfigContract.getEscrowTicketer(claimWithCollectable.collectable.consignment_id);

      let dataClaimant = await TicketCacheRepository.setTransformer(TicketCacheOutputTransformer).findBurntTicketTokensWithConsignmentId(ticketerAddress, wallet_address, claimWithCollectable.collectable.consignment_id);
    
      if (!dataClaimant || dataClaimant.length === 0) {
        return this.sendResponse(
          res,
          { errors: errors.array() },
          "Not found",
          403
        );
      }

      const signAddress = wallet_address.toLowerCase();
      const msg = `I would like to save my shipping information for claim ${claimId} associated with wallet address ${signAddress}.`;
      try {
        let isValidSignature = await Web3Helper.verifySignature(
          msg,
          sig,
          wallet_address
        );
        if (!isValidSignature) {
          this.sendError(res, "Signature is not valid");
          return;
        }
      } catch (e) {
        this.sendError(res, "Signature is not valid");
        return;
      }

      try {

        // Check if submission already exists

        let hasAlreadySubmittedShipping = await CollectableWinnerRepository.findByWalletAddressAndCollectableId(wallet_address, collectable.id);

        if(hasAlreadySubmittedShipping && hasAlreadySubmittedShipping.wallet_address) {
          // update existing info

          await CollectableWinnerRepository.update({
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
            phone,
            message,
          }, hasAlreadySubmittedShipping.id);

          this.sendResponse(res, []);

          if(claimAdminEmailAddresses && claimAdminEmailAddresses.length > 0) {
            sendMail(claimAdminEmailAddresses, `Updated Claim - ${collectable.title}`, `Shipping info has been updated for ${collectable.title} (claim ID ${hasAlreadySubmittedShipping.id})`, `<p>Shipping info updated on <strong>${collectable.title} (claim ID ${hasAlreadySubmittedShipping.id})</strong></p>`);
          }

        } else {

          // create entry

          try {

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
              phone,
              message,
            });

          } catch (e) {
            console.log(e)
            this.sendError(res, "You seem to have already submitted a claim, please contact the team if you need to amend details.");
          }
      
          this.sendResponse(res, []);

          try {
            if(claimAdminEmailAddresses && claimAdminEmailAddresses.length > 0) {
              sendMail(claimAdminEmailAddresses, `New Claim - ${collectable.title}`, `A new claim has been submitted on ${collectable.title}`, `<p>A new claim has been submitted on <strong>${collectable.title}</strong></p>`);
            }
          } catch(e) {
            console.error({e})
          }

        }

      } catch (e) {
        console.log(e)
        this.sendError(res, "Something went wrong, please try again later or contact support for help.");
      }

    }
    
  }

  async checkHasSubmittedShippingInfoAgainstClaim(req, res) {

    const claimId = req.params.claimId;
    const walletAddress = req.params.walletAddress;

    const claimExistenceCheck = await ClaimRepository.findById(claimId);

    if(!claimExistenceCheck && claimExistenceCheck.collectable.id) {
      this.sendError(res, "This claim does not exist");
      return;
    }

    let existingShippingInfo = await CollectableWinnerRepository.findByWalletAddressAndCollectableId(walletAddress, claimExistenceCheck.collectable.id);

    this.sendResponse(res, { hasSubmittedShipping: existingShippingInfo ? true : false });

  }
}

module.exports = ClaimController;
