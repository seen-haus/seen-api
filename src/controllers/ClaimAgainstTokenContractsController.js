const Controller = require("./Controller");
const Web3Service = require("../services/web3.service");
const seenNFTABI = require("../abis/seennftabi.json");
const {
  CollectableWinnerRepository,
  ClaimAgainstTokenContractsRepository,
} = require("../repositories");
const CollectableOutputTransformer = require("../transformers/collectable/output");
const { claimAdminEmailAddresses } = require('../constants/Email')
const { validationResult } = require("express-validator");
const Web3Helper = require("../utils/Web3Helper");
const ClaimOutputTransformer = require("../transformers/claim/output");
const CollectableWinnerOutputTransformer = require("../transformers/collectable_winner/output")

class ClaimAgainstTokenContractsController extends Controller {

  async submitShippingInfoAgainstClaim(req, res) {
    const claimAgainstTokenContractAddress = req.params.claimAgainstTokenContractAddress;

    console.log("Running existence check")

    const claimContractExistenceCheck = await ClaimAgainstTokenContractsRepository.findByColumn("contract_address", claimAgainstTokenContractAddress);

    if(!claimContractExistenceCheck) {
      this.sendError(res, "This claim does not exist");
      return;
    }

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
      signature,
      message,
    } = req.body;

    // Validate signature
    let parsedMessage = false;
    let signer = false;
    if(req.body.msg && JSON.parse(req.body.msg) && req.body.signature) {
        parsedMessage = JSON.parse(req.body.msg);
        if(!parsedMessage['timestamp']) {
            this.sendError(res, 'Error: No signature timestamp provided', 400);
            return;
        }
        if(!parsedMessage['account']) {
            this.sendError(res, 'Error: No signature account provided', 400);
            return;
        }else{
            signer = parsedMessage['account'];
        }
        if(wallet_address !== signer) {
          this.sendError(res, 'Error: Submitted wallet address does not match signer', 400);
          return;
        }
        let currentTimestamp = Math.floor(new Date().getTime() / 1000);
        let secondsDifference = currentTimestamp - Number(parsedMessage['timestamp']);
        // Checks that signature is less than 10 minutes old
        if(secondsDifference < 600) {
            let reconstructedMessage = `{"reason":"Save shipping information for wallet address","account":"${signer}","timestamp":${parsedMessage['timestamp']}}`;

            let isValidSignature = await Web3Helper.verifySignature(reconstructedMessage, req.body.signature, signer);
            if (!isValidSignature) {
                this.sendError(res, 'Error: invalid signature message provided', 400);
                return;
            }

            console.log("Signature is valid");

            // save or update shipping information for EOA address against claim contract
            let existingShippingInfo = await CollectableWinnerRepository.findByWalletAddressAndCatContractRef(wallet_address, claimContractExistenceCheck.id);
            if(!existingShippingInfo) {
              // save shipping info
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
                telegram_username,
                phone,
                message,
                cat_contract_ref: claimContractExistenceCheck.id
              });
            } else {
              // update shipping info
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
                telegram_username,
                phone,
                message,
                cat_contract_ref: claimContractExistenceCheck.id
              }, existingShippingInfo.id);
            }

            this.sendResponse(res, []);
        }

    }
    
  }

  async checkHasSubmittedShippingInfoAgainstClaim(req, res) {

    const claimAgainstTokenContractAddress = req.params.claimAgainstTokenContractAddress;
    const walletAddress = req.params.claimAgainstTokenContractWalletAddress;

    const claimContractExistenceCheck = await ClaimAgainstTokenContractsRepository.findByColumn("contract_address", claimAgainstTokenContractAddress);

    if(!claimContractExistenceCheck) {
      this.sendError(res, "This claim does not exist");
      return;
    }

    let existingShippingInfo = await CollectableWinnerRepository.findByWalletAddressAndCatContractRef(walletAddress, claimContractExistenceCheck.id);
    this.sendResponse(res, existingShippingInfo ? true : false);

  }

  async fetchSubmittedShippingInfoAgainstClaim(req, res) {
    const claimAgainstTokenContractAddress = req.params.claimAgainstTokenContractAddress;

    console.log("Running existence check")

    const claimContractExistenceCheck = await ClaimAgainstTokenContractsRepository.findByColumn("contract_address", claimAgainstTokenContractAddress);

    console.log({claimContractExistenceCheck});

    if(!claimContractExistenceCheck) {
      this.sendError(res, "This claim does not exist");
      return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return this.sendResponse(
        res,
        { errors: errors.array() },
        "Validation error",
        422
      );
    }

    // Validate signature
    let parsedMessage = false;
    let signer = false;
    if(req.body.msg && JSON.parse(req.body.msg) && req.body.signature) {
        parsedMessage = JSON.parse(req.body.msg);
        if(!parsedMessage['timestamp']) {
            this.sendError(res, 'Error: No signature timestamp provided', 400);
            return;
        }
        if(!parsedMessage['account']) {
            this.sendError(res, 'Error: No signature account provided', 400);
            return;
        }else{
            signer = parsedMessage['account'];
        }
        let currentTimestamp = Math.floor(new Date().getTime() / 1000);
        let secondsDifference = currentTimestamp - Number(parsedMessage['timestamp']);
        // Checks that signature is less than 10 minutes old
        if(secondsDifference < 600) {
            let reconstructedMessage = `{"reason":"Fetch shipping information for wallet address","account":"${signer}","timestamp":${parsedMessage['timestamp']}}`;

            let isValidSignature = await Web3Helper.verifySignature(reconstructedMessage, req.body.signature, signer);
            if (!isValidSignature) {
                this.sendError(res, 'Error: invalid signature message provided', 400);
                return;
            }

            console.log("Signature is valid");

            // save or update shipping information for EOA address against claim contract
            let existingShippingInfo = await CollectableWinnerRepository.setTransformer(CollectableWinnerOutputTransformer).findByWalletAddressAndCatContractRef(signer, claimContractExistenceCheck.id);

            this.sendResponse(res, existingShippingInfo);
        } else {
          this.sendError(res, "Signature has expired");
        }

    }
  }
}

module.exports = ClaimAgainstTokenContractsController;
