const Controller = require("./Controller");
const {
  ClaimRepository,
  CollectableWinnerRepository,
  EligibleClaimantRepository,
} = require("./../repositories");
const { claimAdminEmailAddresses } = require('./../constants/Email')
const { validationResult } = require("express-validator");
const Web3Helper = require("./../utils/Web3Helper");
const ClaimOutputTransformer = require("../transformers/claim/output");
const { sendMail } = require('../services/mailgun.service.js');

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

    let claimant = await EligibleClaimantRepository.findByAddress(
      contractAddress,
      wallet_address
    );
    if (!claimant) {
      return this.sendResponse(
        res,
        { errors: errors.array() },
        "Not found",
        400
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
        collectable_id: claimant.claim.collectable.id,
        telegram_username,
        phone,
        message,
      });
  
      this.sendResponse(res, []);

      if(claimAdminEmailAddresses && claimAdminEmailAddresses.length > 0) {
        sendMail(claimAdminEmailAddresses, `New Claim - ${claimant.claim.collectable.title}`, `A new claim has been submitted on ${claimant.claim.collectable.title}`);
      }
    } catch (e) {
      console.log(e)
      this.sendError(res, "Error: you may have already submitted a claim, please contact the team if you need to amend details.");
    }
  }
}

module.exports = ClaimController;
