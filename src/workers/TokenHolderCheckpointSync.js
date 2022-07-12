const Knex = require("knex");
const {Model} = require("objection");

const {dbConfig} = require("./../config");
const {
    TokenHolderBlockTrackerRepository,
} = require("./../repositories/index");

const {
  handleCheckpointSyncERC1155,
  handleCheckpointSyncERC721,
  handleCheckpointSyncERC20,
} = require("./helpers/TokenHolderCheckpointSyncHelpers");

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
        if(enabledTracker.token_standard === "ERC20") {
          await handleCheckpointSyncERC20(enabledTracker);
        } else if(enabledTracker.token_standard === "ERC721") {
          await handleCheckpointSyncERC721(enabledTracker);
        } else if(enabledTracker.token_standard === "ERC1155") {
          await handleCheckpointSyncERC1155(enabledTracker);
        }
      }
    } catch (e) {
        console.log(e);
    }

    process.exit();
}

run();