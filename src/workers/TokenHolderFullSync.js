const Knex = require("knex");
const ethers = require('ethers');
const {Model} = require("objection");
const axios = require('axios');
const BigNumber = require('bignumber.js');

const {dbConfig} = require("../config");
const {
    TokenHolderBlockTrackerRepository,
    TokenCacheRepository
} = require("../repositories/index");

const {
  handleFullSyncERC1155,
  handleFullSyncERC721,
  handleFullSyncERC20,
} = require("./helpers/TokenHolderFullSyncHelpers");

// const

// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

const getActiveTrackers = async () => {
    let activeBalanceTrackers = await TokenHolderBlockTrackerRepository.getActiveTrackers();
    return activeBalanceTrackers;
}

/**
 * Keeps track of token holders
 * @return {Promise<void>}
 */
const run = async() => {

    const enabledTrackers = await getActiveTrackers();

    try {
      for(let enabledTracker of enabledTrackers) {
        if (enabledTracker.token_standard === "ERC20") {
          await handleFullSyncERC20(enabledTracker);
        } else if(enabledTracker.token_standard === "ERC721") {
          await handleFullSyncERC721(enabledTracker);
        } else if(enabledTracker.token_standard === "ERC1155") {
          await handleFullSyncERC1155(enabledTracker);
        }
      }
    } catch (e) {
        console.log(e);
    }
    process.exit();
}

run();