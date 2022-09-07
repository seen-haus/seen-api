const Knex = require("knex");
const {Model} = require("objection");

const {dbConfig} = require("./../config");
const {
  CurationRoundDeclarationRepository,
  CurationSelfMintingApplicantsVotesRepository,
  CurationSelfMintingApplicantsOverviewRepository,
} = require("./../repositories/index");

const {
  handleFullSyncERC1155,
  handleFullSyncERC721,
  handleFullSyncERC20,
} = require("./helpers/TokenHolderFullSyncHelpers");

const Web3Service = require('../services/web3.service');
const ERC20ABI = require('../abis/erc20.json');

// Assume average block time of 13 seconds
const averageBlockSeconds = 13;

// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

const getCompletedCurationRounds = async (timestamp) => {
  let completedRounds = await CurationRoundDeclarationRepository.getCompletedRounds(timestamp);
  console.log({completedRounds})
  return completedRounds;
}

/**
 * Keeps track of token holders
 * @return {Promise<void>}
 */
const run = async() => {
    let timestamp = Math.floor(new Date().getTime() / 1000);

    const completedRounds = await getCompletedCurationRounds(timestamp);

    let unarchivedRounds = completedRounds.filter(item => item.archive === null);

    try {
      for(let completedRound of unarchivedRounds) {
        let roundId = completedRound.id;
        if(completedRound.topic === 'self_minting_applicants') {
          // Get all votes & applicant overviews for the round
          let votes = await CurationSelfMintingApplicantsVotesRepository.findAllByColumn('round_declaration_id', roundId);
          let applicantOverviews = await CurationSelfMintingApplicantsOverviewRepository.findAllByColumn('round_declaration_id', roundId);
          let archiveData = {
            votes,
            applicantOverviews
          }
          let archiveJSON = JSON.stringify(archiveData);
          // Save archive data
          await CurationRoundDeclarationRepository.update({archive: archiveJSON}, roundId)
        }
      }
    } catch (e) {
        console.log(e);
    }

    process.exit();
}

run();