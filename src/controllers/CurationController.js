const Controller = require('./Controller');
const BigNumber = require('bignumber.js');
const ethers = require('ethers');

const SelfMintingApplicantOutputWithSingleCurationRoundOverviewTransformer = require("../transformers/self-minting-applicant/output-with-single-curation-round-overview");
const CurationRoundDeclarationOutputTransformer = require("../transformers/curation_round_declaration/output");
const ApplicantVoteOverviewOutputTransformer = require("../transformers/applicant_vote_overview/output")
const {
  CurationSelfMintingApplicantsOverviewRepository,
  CurationSelfMintingApplicantsVotesRepository,
  SelfMintingInternalAccessRequestsRepository,
  CurationRoundDeclarationRepository,
  SnapshotCacheRepository,
  SnapshotDeclarationRepository
} = require('../repositories');
const Web3Helper = require("./../utils/Web3Helper");

BigNumber.config({ EXPONENTIAL_AT: 1e+9 })
class CurationController extends Controller {

    async applicants(req, res) {

      const { roundDeclarationId, applicantType } = req.query;

      if(!applicantType || !roundDeclarationId) {
        this.sendError(res, 'Missing required param(s)');
        return;
      }

      const pagination = this.extractPagination(req);

      let applicantData;

      if(applicantType == 'self_minting_applicants') {
        applicantData = await SelfMintingInternalAccessRequestsRepository
          .setTransformer(SelfMintingApplicantOutputWithSingleCurationRoundOverviewTransformer)
          .paginateOrderByEffective(pagination.perPage, pagination.page, roundDeclarationId);
      }

      this.sendResponse(res, applicantData);
    }

    async getLatestSnapshotInfo(req, res) {

      // Get latest snapshot block of SEEN & xSEEN, compare, send back results

      const latestSnapshotBlockSEEN = await SnapshotDeclarationRepository.findByColumn('token_address', "0xca3fe04c7ee111f0bbb02c328c699226acf9fd33");
      const latestSnapshotBlockXSEEN = await SnapshotDeclarationRepository.findByColumn('token_address', "0x38747BAF050d3C22315a761585868DbA16abFD89");

      this.sendResponse(res, {
        SEEN: latestSnapshotBlockSEEN ? latestSnapshotBlockSEEN.last_snapshot_block : null,
        xSEEN: latestSnapshotBlockXSEEN ? latestSnapshotBlockXSEEN.last_snapshot_block : null
      });
      return;

    }

    async latestRound(req, res) {
      const curationType = req.query.curationType;

      let latestRound = await CurationRoundDeclarationRepository.setTransformer(CurationRoundDeclarationOutputTransformer).findByColumn('topic', curationType);

      this.sendResponse(res, latestRound);

    }

    async votingPower(req, res) {
      const account = req.query.account;

      let votingPowerInfo = await SnapshotCacheRepository.findAllByColumn('token_holder', account);

      let unifiedData = {
        total_voting_power: '0',
        allocated_voting_power: '0',
        unallocated_voting_power: '0',
      }

      if(votingPowerInfo && (votingPowerInfo.length > 0)) {
        for(let votingTokenSnapshotEntry of votingPowerInfo) {
          unifiedData['total_voting_power'] = new BigNumber(votingTokenSnapshotEntry['token_balance']).decimalPlaces(0, 1).plus(new BigNumber(unifiedData['total_voting_power'])).toString();
          unifiedData['allocated_voting_power'] = new BigNumber(votingTokenSnapshotEntry['token_balance_consumed']).plus(new BigNumber(unifiedData['allocated_voting_power'])).toString();
        }
        unifiedData['unallocated_voting_power'] = new BigNumber(unifiedData['total_voting_power']).minus(new BigNumber(unifiedData['allocated_voting_power'])).decimalPlaces(0, 1).toString();
        // remove decimals so we can just work in integers
        unifiedData['total_voting_power'] = new BigNumber(unifiedData['total_voting_power']).decimalPlaces(0, 1).toString();
        unifiedData['allocated_voting_power'] = new BigNumber(unifiedData['allocated_voting_power']).decimalPlaces(0, 1).toString();
      }

      this.sendResponse(res, unifiedData);
    }

    async getExistingVote(req, res) {
      let { account, curationType, applicantId, roundDeclarationId } = req.query;

      if(!account || !curationType || !applicantId || !roundDeclarationId) {
        this.sendError(res, 'Missing required param(s)');
        return;
      }

      let existingVote;
      if(curationType === 'self_minting_applicants') {
        existingVote = await CurationSelfMintingApplicantsVotesRepository.getExistingVoteByApplicantIdAndVoterAddress(applicantId, account, roundDeclarationId);
      }

      if(existingVote) {
        this.sendResponse(res, existingVote);
      } else {
        this.sendResponse(res, null);
      }
      return;
    }

    async getApplicantVoteOverview(req, res) {
      let { curationType, applicantId, roundDeclarationId } = req.query;

      if(!curationType || !applicantId || !roundDeclarationId) {
        this.sendError(res, 'Missing required param(s)');
        return;
      }

      let applicantVoteOverview;
      if(curationType === 'self_minting_applicants') {
        applicantVoteOverview = await CurationSelfMintingApplicantsOverviewRepository.setTransformer(ApplicantVoteOverviewOutputTransformer).getCurrentVoteReceiverOverview(applicantId, roundDeclarationId);
      }

      if(applicantVoteOverview) {
        this.sendResponse(res, applicantVoteOverview);
      } else {
        this.sendResponse(res, null);
      }
      return;
    }

    async voteForApplicant(req, res) {

      const {
        signature,
        msg,
      } = req.body;
      
      const parsedMessage = JSON.parse(msg);

      let reconstructedMessage = JSON.stringify({ ...parsedMessage });

      try {
        let { success: isValidSignature, reason } = await Web3Helper.verifySignatureCurationVote(
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

      // Is valid signature, continue with voting process

      let validApplicantId = false;
      let existingVote = false;
      let activeRound = false;
      let currentTimeUnix = Math.floor(new Date().getTime() / 1000);

      if(parsedMessage.reason === 'Cast minting curation vote') {

        let roundIdentifier = 'self_minting_applicants';

        // Check if there is an active voting round ongoing
        activeRound = await CurationRoundDeclarationRepository.getActiveRound(currentTimeUnix, roundIdentifier);

        // Check that parsedMessage['round declaration ID'] links to the currently active round
        if(Number(parsedMessage['round declaration ID']) !== activeRound.id) {
          this.sendError(res, "Incorrect round declaration ID");
          return;
        }

        // Check that applicant ID is valid
        validApplicantId = await SelfMintingInternalAccessRequestsRepository.find(parsedMessage['applicant ID']);
        if(!validApplicantId) {
          this.sendError(res, "Invalid applicant ID");
          return;
        }

        // Check if voter has already voted for applicant
        // This determines if we are doing an update to an existing vote or a new vote altogether
        existingVote = await CurationSelfMintingApplicantsVotesRepository.getExistingVoteByApplicantIdAndVoterAddress(parsedMessage['applicant ID'], parsedMessage.account, parsedMessage['round declaration ID']);

      }

      if(!activeRound) {
        this.sendError(res, "Curation round not active");
        return;
      }

      let newVoteType = parsedMessage['vote type'];
      let votePowerToCredit = 0;
      let votePowerToDebit = 0;
      let isExistingVoteYes = false;
      let isExistingVoteNo = false;
      let useExistingVoteType;
      let isNewVoteLarger = false;
      let isNewVoteSmaller = false;
      
      if(existingVote) {
        isExistingVoteYes = new BigNumber(existingVote['yes']).isGreaterThan(new BigNumber(existingVote['no']));
        isExistingVoteNo = new BigNumber(existingVote['no']).isGreaterThan(new BigNumber(existingVote['yes']));
        if(isExistingVoteYes) {
          useExistingVoteType = 'yes';
        } else if(isExistingVoteNo) {
          useExistingVoteType = 'no';
        }
        if(isExistingVoteYes || isExistingVoteNo) {
          isNewVoteLarger = new BigNumber(parsedMessage['vote power']).isGreaterThan(new BigNumber(existingVote[useExistingVoteType]));
          isNewVoteSmaller = new BigNumber(existingVote[useExistingVoteType]).isGreaterThan(new BigNumber(parsedMessage['vote power']));
          if(isNewVoteLarger) {
            votePowerToDebit = new BigNumber(parsedMessage['vote power']).minus(new BigNumber(existingVote[useExistingVoteType]));
          } else if (isNewVoteSmaller) {
            votePowerToCredit = new BigNumber(existingVote[useExistingVoteType]).minus(new BigNumber(parsedMessage['vote power']));
          }
        } else {
          votePowerToDebit = new BigNumber(parsedMessage['vote power']);
        }
      } else {
        votePowerToDebit = new BigNumber(parsedMessage['vote power']);
      }

      // Get voter info
      let votingPowerInfo = await SnapshotCacheRepository.findAllByColumn('token_holder', parsedMessage.account);

      let unifiedData = {
        total_voting_power: '0',
        allocated_voting_power: '0',
        unallocated_voting_power: '0',
      }

      if(votingPowerInfo && (votingPowerInfo.length > 0)) {
        for(let votingTokenSnapshotEntry of votingPowerInfo) {
          unifiedData['total_voting_power'] = new BigNumber(votingTokenSnapshotEntry['token_balance']).decimalPlaces(0, 1).plus(new BigNumber(unifiedData['total_voting_power'])).toString();
          unifiedData['allocated_voting_power'] = new BigNumber(votingTokenSnapshotEntry['token_balance_consumed']).plus(new BigNumber(unifiedData['allocated_voting_power'])).toString();
        }
        // remove decimals so we can just work in integers
        unifiedData['total_voting_power'] = new BigNumber(unifiedData['total_voting_power']).decimalPlaces(0, 1).toString();
        unifiedData['allocated_voting_power'] = new BigNumber(unifiedData['allocated_voting_power']).decimalPlaces(0, 1).toString();
        unifiedData['unallocated_voting_power'] = new BigNumber(unifiedData['total_voting_power']).minus(new BigNumber(unifiedData['allocated_voting_power'])).decimalPlaces(0, 1).toString();
      } else {
        this.sendError(res, "No voting power");
      }

      // Manage any debits

      if(votePowerToDebit) {
        // Check that voter has sufficient unallocated voting power
        let isSufficientUnallocated = new BigNumber(unifiedData['unallocated_voting_power']).isGreaterThanOrEqualTo(new BigNumber(votePowerToDebit));
        if(!isSufficientUnallocated) {
          this.sendError(res, "Insufficient unallocated voting power");
          return;
        } else {
          let remainingVotePowerToDebit = new BigNumber(votePowerToDebit);
          for(let votingTokenSnapshotEntry of votingPowerInfo) {
            if(remainingVotePowerToDebit.isGreaterThanOrEqualTo(new BigNumber(0))) {
              let consumesWholeBalance = new BigNumber(remainingVotePowerToDebit).isGreaterThanOrEqualTo(new BigNumber(votingTokenSnapshotEntry['token_balance']).minus(new BigNumber(votingTokenSnapshotEntry['token_balance_consumed'])));
              if(consumesWholeBalance) {
                let isEligableForVotePowerConsumption = new BigNumber(votingTokenSnapshotEntry['token_balance']).decimalPlaces(0, 1).isGreaterThan(new BigNumber(0));
                if(isEligableForVotePowerConsumption) {
                  let consumeVotePower = new BigNumber(votingTokenSnapshotEntry['token_balance']).decimalPlaces(0, 1).toString();
                  await SnapshotCacheRepository.update({token_balance_consumed: consumeVotePower }, votingTokenSnapshotEntry.id);
                  remainingVotePowerToDebit = remainingVotePowerToDebit.minus(new BigNumber(consumeVotePower).minus(new BigNumber(votingTokenSnapshotEntry['token_balance_consumed'])));
                }
              } else {
                let newBalanceConsumed = new BigNumber(votingTokenSnapshotEntry['token_balance_consumed']).plus(remainingVotePowerToDebit);
                await SnapshotCacheRepository.update({token_balance_consumed: newBalanceConsumed.toString() }, votingTokenSnapshotEntry.id);
                remainingVotePowerToDebit = new BigNumber(0);
              }
            }
          }
        }
      }

      // Manage any credits

      if(votePowerToCredit) {
        let remainingVotePowerToCredit = new BigNumber(votePowerToCredit);
        for(let votingTokenSnapshotEntry of votingPowerInfo) {
          if(remainingVotePowerToCredit.isGreaterThanOrEqualTo(new BigNumber(0))) {
            let creditsWholeBalance = new BigNumber(remainingVotePowerToCredit).isGreaterThanOrEqualTo(new BigNumber(votingTokenSnapshotEntry['token_balance_consumed']));
            if(creditsWholeBalance) {
              await SnapshotCacheRepository.update({token_balance_consumed: '0' }, votingTokenSnapshotEntry.id);
              remainingVotePowerToCredit = remainingVotePowerToCredit.minus(new BigNumber(votingTokenSnapshotEntry['token_balance_consumed']));
            } else {
              let newBalanceConsumed = new BigNumber(votingTokenSnapshotEntry['token_balance_consumed']).minus(remainingVotePowerToCredit);
              await SnapshotCacheRepository.update({token_balance_consumed: newBalanceConsumed.toString() }, votingTokenSnapshotEntry.id);
              remainingVotePowerToCredit = new BigNumber(0);
            }
          }
        }
      }

      // Get current overview for vote receiver
      let currentVoteReceiverOverview = false;
      if(parsedMessage.reason === 'Cast minting curation vote') {
        currentVoteReceiverOverview = await CurationSelfMintingApplicantsOverviewRepository.getCurrentVoteReceiverOverview(validApplicantId.id, parsedMessage['round declaration ID']);
      }

      // Update vote overview
      if(existingVote && currentVoteReceiverOverview) {
        // calc diff
        if(parsedMessage.reason === 'Cast minting curation vote') {
          if(useExistingVoteType === newVoteType) {
            // Vote power adjusted without switching intent
            if(isNewVoteLarger) {
              if(newVoteType === 'yes') {
                let newOverviewYesBalance = new BigNumber(currentVoteReceiverOverview['total_yes']).plus(new BigNumber(votePowerToDebit)).toNumber();
                let newOverviewEffectiveBalance = new BigNumber(currentVoteReceiverOverview['total_effective']).plus(new BigNumber(votePowerToDebit)).toNumber();
                await CurationSelfMintingApplicantsOverviewRepository.update({'total_yes': newOverviewYesBalance, 'total_effective': newOverviewEffectiveBalance}, currentVoteReceiverOverview.id);
              } else if(newVoteType === 'no') {
                let newOverviewNoBalance = new BigNumber(currentVoteReceiverOverview['total_no']).plus(new BigNumber(votePowerToDebit)).toNumber();
                let newOverviewEffectiveBalance = new BigNumber(currentVoteReceiverOverview['total_effective']).minus(new BigNumber(votePowerToDebit)).toNumber();
                await CurationSelfMintingApplicantsOverviewRepository.update({'total_no': newOverviewNoBalance, 'total_effective': newOverviewEffectiveBalance}, currentVoteReceiverOverview.id);
              }
            }
            if(isNewVoteSmaller) {
              if(newVoteType === 'yes') {
                let newOverviewYesBalance = new BigNumber(currentVoteReceiverOverview['total_yes']).minus(new BigNumber(votePowerToCredit)).toNumber();
                let newOverviewEffectiveBalance = new BigNumber(currentVoteReceiverOverview['total_effective']).minus(new BigNumber(votePowerToCredit)).toNumber();
                await CurationSelfMintingApplicantsOverviewRepository.update({'total_yes': newOverviewYesBalance, 'total_effective': newOverviewEffectiveBalance}, currentVoteReceiverOverview.id);
              } else if(newVoteType === 'no') {
                let newOverviewNoBalance = new BigNumber(currentVoteReceiverOverview['total_no']).minus(new BigNumber(votePowerToCredit)).toNumber();
                let newOverviewEffectiveBalance = new BigNumber(currentVoteReceiverOverview['total_effective']).plus(new BigNumber(votePowerToCredit)).toNumber();
                await CurationSelfMintingApplicantsOverviewRepository.update({'total_no': newOverviewNoBalance, 'total_effective': newOverviewEffectiveBalance}, currentVoteReceiverOverview.id);
              }
            }
          } else if (useExistingVoteType !== newVoteType) {
            // Vote intent switched
            // First, remove old vote's power completely from overview
            let existingVotePower = existingVote[useExistingVoteType];
            let newOverviewEffectiveBalanceReset;
            if(useExistingVoteType === 'yes') {
              let newOverviewYesBalance = new BigNumber(currentVoteReceiverOverview['total_yes']).minus(new BigNumber(existingVotePower)).toNumber();
              newOverviewEffectiveBalanceReset = new BigNumber(currentVoteReceiverOverview['total_effective']).minus(new BigNumber(existingVotePower)).toNumber();
              await CurationSelfMintingApplicantsOverviewRepository.update({'total_yes': newOverviewYesBalance, 'total_effective': newOverviewEffectiveBalanceReset}, currentVoteReceiverOverview.id);
            } else if (useExistingVoteType === 'no') {
              let newOverviewNoBalance = new BigNumber(currentVoteReceiverOverview['total_no']).minus(new BigNumber(existingVotePower)).toNumber();
              newOverviewEffectiveBalanceReset = new BigNumber(currentVoteReceiverOverview['total_effective']).plus(new BigNumber(existingVotePower)).toNumber();
              await CurationSelfMintingApplicantsOverviewRepository.update({'total_no': newOverviewNoBalance, 'total_effective': newOverviewEffectiveBalanceReset}, currentVoteReceiverOverview.id);
            }
            // Next, add new vote's full power to relevant side
            if(newVoteType === 'yes') {
              let newOverviewYesBalance = new BigNumber(currentVoteReceiverOverview['total_yes']).plus(new BigNumber(parsedMessage['vote power'])).toNumber();
              let newOverviewEffectiveBalance = new BigNumber(newOverviewEffectiveBalanceReset).plus(new BigNumber(parsedMessage['vote power'])).toNumber();
              await CurationSelfMintingApplicantsOverviewRepository.update({'total_yes': newOverviewYesBalance, 'total_effective': newOverviewEffectiveBalance}, currentVoteReceiverOverview.id);
            } else if(newVoteType === 'no') {
              let newOverviewNoBalance = new BigNumber(currentVoteReceiverOverview['total_no']).plus(new BigNumber(parsedMessage['vote power'])).toNumber();
              let newOverviewEffectiveBalance = new BigNumber(newOverviewEffectiveBalanceReset).minus(new BigNumber(parsedMessage['vote power'])).toNumber();
              await CurationSelfMintingApplicantsOverviewRepository.update({'total_no': newOverviewNoBalance, 'total_effective': newOverviewEffectiveBalance}, currentVoteReceiverOverview.id);
            }
          }
        }
      } else {
        if(parsedMessage.reason === 'Cast minting curation vote') {
          if(currentVoteReceiverOverview) {
            if(newVoteType === 'yes') {
              let newOverviewYesBalance = new BigNumber(currentVoteReceiverOverview['total_yes']).plus(new BigNumber(parsedMessage['vote power'])).toNumber();
              let newOverviewEffectiveBalance = new BigNumber(currentVoteReceiverOverview['total_effective']).plus(new BigNumber(parsedMessage['vote power'])).toNumber();
              await CurationSelfMintingApplicantsOverviewRepository.update({'total_yes': newOverviewYesBalance, 'total_effective': newOverviewEffectiveBalance}, currentVoteReceiverOverview.id);
            } else if(newVoteType === 'no') {
              let newOverviewNoBalance = new BigNumber(currentVoteReceiverOverview['total_no']).plus(new BigNumber(parsedMessage['vote power'])).toNumber();
              let newOverviewEffectiveBalance = new BigNumber(currentVoteReceiverOverview['total_effective']).minus(new BigNumber(parsedMessage['vote power'])).toNumber();
              await CurationSelfMintingApplicantsOverviewRepository.update({'total_no': newOverviewNoBalance, 'total_effective': newOverviewEffectiveBalance}, currentVoteReceiverOverview.id);
            }
          } else {
            // Credit applicant overview
            if(newVoteType === 'yes') {
              await CurationSelfMintingApplicantsOverviewRepository.create({'sm_applicant_id': validApplicantId.id, round_declaration_id: parsedMessage['round declaration ID'], 'total_yes': new BigNumber(parsedMessage['vote power']).toNumber(), 'total_no': 0, 'total_effective': new BigNumber(parsedMessage['vote power']).toNumber()});
            } else if(newVoteType === 'no') {
              await CurationSelfMintingApplicantsOverviewRepository.create({'sm_applicant_id': validApplicantId.id, round_declaration_id: parsedMessage['round declaration ID'], 'total_no': new BigNumber(parsedMessage['vote power']).toNumber(), 'total_yes': 0, 'total_effective': new BigNumber(0).minus(new BigNumber(parsedMessage['vote power'])).toNumber()});
            }
          }
        }
      }

      // Set new vote state
      if(existingVote) {
        if(parsedMessage.reason === 'Cast minting curation vote') {
          // Clear existing vote state
          await CurationSelfMintingApplicantsVotesRepository.update({yes: '0', no: '0'}, existingVote.id);
          // Set new vote state
          if(newVoteType === 'yes') {
            await CurationSelfMintingApplicantsVotesRepository.update({yes: parsedMessage['vote power']}, existingVote.id);
          } else if (newVoteType === 'no') {
            await CurationSelfMintingApplicantsVotesRepository.update({no: parsedMessage['vote power']}, existingVote.id);
          }
        }
      } else {
        if(parsedMessage.reason === 'Cast minting curation vote') {
          if(newVoteType === 'yes') {
            await CurationSelfMintingApplicantsVotesRepository.create({sm_applicant_id: parsedMessage['applicant ID'], round_declaration_id: parsedMessage['round declaration ID'], voter_address: ethers.utils.getAddress(parsedMessage['account']), yes: parsedMessage['vote power'], no: 0});
          } else if (newVoteType === 'no') {
            await CurationSelfMintingApplicantsVotesRepository.create({sm_applicant_id: parsedMessage['applicant ID'], round_declaration_id: parsedMessage['round declaration ID'], voter_address: ethers.utils.getAddress(parsedMessage['account']), no: parsedMessage['vote power'], yes: 0});
          }
        }
      }

      this.sendResponse(res, {vote_result: 'success'});
    }
    
}

module.exports = CurationController;
