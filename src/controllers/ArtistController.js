const Controller = require('./Controller');
const {ArtistRepository} = require("./../repositories");
const ArtistOutputTransformer = require("../transformers/artist/output");
const { validationResult } = require("express-validator");
const { sendSelfMintingAccessRequestReceivedNotification } = require('../services/sendgrid.service.js');
const Web3Helper = require("./../utils/Web3Helper");
const SelfMintingInternalAccessRequestsRepository = require('../repositories/SelfMintingInternalAccessRequestsRepository');
const { SelfMintingInternalAccessRequests } = require('../models');

class ArtistController extends Controller {

    async index(req, res) {
        const pagination = this.extractPagination(req)
        const includeIsHiddenFromArtistList = req.query.includeIsHiddenFromArtistList;
        const data = await ArtistRepository
            .setTransformer(ArtistOutputTransformer)
            .paginate(pagination.perPage, pagination.page, {includeIsHiddenFromArtistList});

        this.sendResponse(res, data);
    }

    async show(req, res) {
        const slug = req.params.slug;
        let data = await ArtistRepository
            .setTransformer(ArtistOutputTransformer)
            .findByColumn("slug", slug);

        if (!data) {
            data = await ArtistRepository
                .setTransformer(ArtistOutputTransformer)
                .findByColumn("id", slug);
        }

        this.sendResponse(res, data);
    }

    async search(req, res) {
        const query = req.query.q;
        if (!query) {
            return this.sendResponse(res, null);
        }

        const artist = await ArtistRepository.search(query)
        this.sendResponse(res, artist);
    }

    async newRequest(req, res) {
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
          email,
          name,
          signature,
          msg,
          twitter,
          instagram,
          website
        } = req.body;
        
        const parsedMessage = JSON.parse(msg);
        
        let reconstructedMessage = JSON.stringify({ ...parsedMessage, reason: `Request access to SEEN.HAUS self-minting.`});
        try {
          let { success: isValidSignature, reason } = await Web3Helper.verifySignatureV2(
            reconstructedMessage,
            signature,
            parsedMessage.account
          );
          if (!isValidSignature) {
            this.sendError(res, reason);
            return;
          }
        } catch (e) {
          console.log(e);
          this.sendError(res, "Signature is not valid");
          return;
        }
    
        try {
          const existingRecord = await SelfMintingInternalAccessRequestsRepository.findByColumn(SelfMintingInternalAccessRequests.wallet_addressColumn, parsedMessage.account);  
          if(existingRecord){
            this.sendError(res, "This address has already submitted a request.");
            return;
          }
        } catch (e){
          console.log(e);
          this.sendError(res, "Something went wrong when checking for previous submissions");
          return;
        }

        try {
          await SelfMintingInternalAccessRequestsRepository.create({
            name,
            email,
            wallet_address: parsedMessage.account,
            socials: JSON.stringify({ twitter, instagram, website })
          });
          this.sendResponse(res, []);
    
          if(email && email.length > 0) {
            sendSelfMintingAccessRequestReceivedNotification(email);
          }
        } catch (e) {
          console.log(e)
          this.sendError(res, "Error: We were not able to subit your request to self-mint. Please try again later.");
        }
      }
}

module.exports = ArtistController;
