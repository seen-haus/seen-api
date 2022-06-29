const Knex = require("knex");
const {Model} = require("objection");

const {dbConfig} = require("./../config");
const {
    TokenHolderBlockTrackerRepository,
} = require("./../repositories/index");

const {
  handleCheckpointSync1155,
  handleCheckpointSync721,
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
        if(enabledTracker.token_standard === "ERC721") {
          await handleCheckpointSync721(enabledTracker);
        } else if(enabledTracker.token_standard === "ERC1155") {
          await handleCheckpointSync1155(enabledTracker);
        }
      }
    } catch (e) {
        console.log(e);
    }

    process.exit();
}

run();