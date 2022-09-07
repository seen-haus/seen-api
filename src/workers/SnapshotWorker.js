const Knex = require("knex");
const {Model} = require("objection");

const {dbConfig} = require("./../config");
const {
  SnapshotDeclarationRepository,
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

const getActiveSnapshots = async () => {
    let activeSnapshotDeclarations = await SnapshotDeclarationRepository.getActiveSnapshots();
    return activeSnapshotDeclarations;
}

const honeIntoTarget = async (tokenContract, targetTimestamp, estimatedTargetBlock) => {
  let estimatedTargetBlockInfo = await tokenContract.getBlockInfo(estimatedTargetBlock);
  let estimatedToTargetTimeDelta = targetTimestamp - estimatedTargetBlockInfo.timestamp;
  console.log({estimatedToTargetTimeDelta})
  if(estimatedToTargetTimeDelta === 0) {
    // On target
    return estimatedTargetBlock;
  } else if(estimatedToTargetTimeDelta < 0) {
    // Too far forward
    console.log(`Block ${estimatedTargetBlock} too far forward (${estimatedTargetBlockInfo.timestamp})`)
    let estimatedBlocksBack = Math.ceil((estimatedToTargetTimeDelta * -1) / averageBlockSeconds);
    console.log({estimatedBlocksBack})
    if(estimatedBlocksBack < 10) {
      // Check to see if next block is too far forward, if so, use whichever block is closest to target
      let estimatedTargetBlockInfoPrevious = await tokenContract.getBlockInfo(estimatedTargetBlock - 1);
      let estimatedToTargetTimeDeltaPrevious = targetTimestamp - estimatedTargetBlockInfoPrevious.timestamp;
      console.log({estimatedToTargetTimeDeltaPrevious})
      if(estimatedToTargetTimeDeltaPrevious > 0) {
        // Previous block too far back, therefore we should use either the current block or the previous one
        // let timeToPreviousBlock = estimatedToTargetTimeDeltaPrevious;
        // let timeToCurrentBlock = estimatedToTargetTimeDelta * -1;
        // if(timeToCurrentBlock < timeToPreviousBlock) {
        //   return estimatedTargetBlock;
        // } else {
        //   return estimatedTargetBlock - 1;
        // }

        // Default to first block after target time
        return estimatedTargetBlock;
      } else {
        // Previous block too far forward, improve estimatedBlocksBack accuracy
        let subtractBlocks = 2;
        let estimatedToTargetTimeDeltaCheckerPrevious = estimatedToTargetTimeDeltaPrevious;
        for(let estimatedBlockBack of Array.from({length: estimatedBlocksBack})) {
          if(subtractBlocks <= estimatedBlocksBack) {
            let estimatedTargetBlockInfoChecker = await tokenContract.getBlockInfo(estimatedTargetBlock - subtractBlocks);
            let estimatedToTargetTimeDeltaChecker = targetTimestamp - estimatedTargetBlockInfoChecker.timestamp;
            if(estimatedToTargetTimeDeltaChecker > 0) {
              return (estimatedTargetBlock - subtractBlocks) + 1
            }
            subtractBlocks++;
          }
        }
      }
    }
    return honeIntoTarget(tokenContract, targetTimestamp, estimatedTargetBlock - estimatedBlocksBack);
  } else if (estimatedToTargetTimeDelta > 0) {
    // Too far back
    console.log(`Block ${estimatedTargetBlock} too far back (${estimatedTargetBlockInfo.timestamp})`)
    let estimatedBlocksForward = Math.ceil(estimatedToTargetTimeDelta / averageBlockSeconds);
    console.log({estimatedBlocksForward})
    if(estimatedBlocksForward < 10) {
      // Check to see if next block is too far forward, if so, use whichever block is closest to target
      let estimatedTargetBlockInfoNext = await tokenContract.getBlockInfo(estimatedTargetBlock + 1);
      let estimatedToTargetTimeDeltaNext = targetTimestamp - estimatedTargetBlockInfoNext.timestamp;
      console.log({estimatedToTargetTimeDeltaNext})
      if(estimatedToTargetTimeDeltaNext < 0) {
        // Next block too far forward, therefore we should use either the current block or the next one
        // let timeToNextBlock = estimatedToTargetTimeDeltaNext * -1;
        // let timeToCurrentBlock = estimatedToTargetTimeDelta;
        // if(timeToCurrentBlock < timeToNextBlock) {
        //   return estimatedTargetBlock;
        // } else {
        //   return estimatedTargetBlock + 1;
        // }

        // Default to first block after target
        return estimatedTargetBlock + 1;
      } else {
        // Previous block too far forward, improve estimatedBlocksBack accuracy
        let addBlocks = 2;
        let estimatedToTargetTimeDeltaCheckerNext = estimatedToTargetTimeDeltaNext;
        for(let estimatedBlockForward of Array.from({length: estimatedBlocksForward})) {
          if(addBlocks <= estimatedBlocksForward) {
            let estimatedTargetBlockInfoChecker = await tokenContract.getBlockInfo(estimatedTargetBlock + addBlocks);
            let estimatedToTargetTimeDeltaChecker = targetTimestamp - estimatedTargetBlockInfoChecker.timestamp;
            if(estimatedToTargetTimeDeltaChecker < 0) {
              return (estimatedTargetBlock + addBlocks) - 1
            }
            addBlocks++;
          }
        }
      }
    }
    return honeIntoTarget(tokenContract, targetTimestamp, estimatedTargetBlock + estimatedBlocksForward);
  }
}

const findClosestBlock = async (tokenContract, targetTimestamp) => {
  
  let currentBlockNumber = await tokenContract.getRecentBlock();
  let currentBlockInfo = await tokenContract.getBlockInfo(currentBlockNumber);
  let currentBlockTimestamp = currentBlockInfo.timestamp;
  let deltaCurrentToTarget = currentBlockTimestamp - targetTimestamp;
  console.log({currentBlockNumber, currentBlockTimestamp, targetTimestamp, deltaCurrentToTarget});
  if(deltaCurrentToTarget > 0) {
    let estimatedBlocksBack = Math.ceil(deltaCurrentToTarget / averageBlockSeconds);
    let initHoneBlock = currentBlockNumber - estimatedBlocksBack;
    console.log({initHoneBlock, targetTimestamp})
    let closestBlock = await honeIntoTarget(tokenContract, targetTimestamp, initHoneBlock);
    console.log({closestBlock})
    return closestBlock;
  } else {
    return 0;
  }
}

/**
 * Keeps track of token holders
 * @return {Promise<void>}
 */
const run = async() => {
    const enabledSnapshots = await getActiveSnapshots();

    console.log({enabledSnapshots})

    try {
      for(let enabledSnapshot of enabledSnapshots) {

        // Derive snapshot block
        let tokenContract = new Web3Service(enabledSnapshot.token_address, ERC20ABI);
        let closestBlock = false;
        let alreadySyncedClosestBlock = false;
        let targetTimestamp;
        if(!enabledSnapshot.last_snapshot_block) {
          // Use first_snapshot_unix as target
          targetTimestamp = enabledSnapshot.first_snapshot_target_unix;
          closestBlock = await findClosestBlock(tokenContract, targetTimestamp);
        } else if (enabledSnapshot.next_snapshot_target_unix) {
          targetTimestamp = enabledSnapshot.next_snapshot_target_unix;
          closestBlock = await findClosestBlock(tokenContract, targetTimestamp);
          if(!closestBlock || (closestBlock === enabledSnapshot.last_snapshot_block)) {
            alreadySyncedClosestBlock = true;
            console.log("Closest block already synced");
          }
        } else {
          targetTimestamp = enabledSnapshot.last_snapshot_target_unix + enabledSnapshot.snapshot_interval;
          closestBlock = await findClosestBlock(tokenContract, targetTimestamp);
          if(!closestBlock || (closestBlock === enabledSnapshot.last_snapshot_block)) {
            alreadySyncedClosestBlock = true;
            console.log("Closest block already synced");
          }
        }

        if(closestBlock && !alreadySyncedClosestBlock) {
          let closestBlockInfo = await tokenContract.getBlockInfo(closestBlock);
          if(enabledSnapshot.token_data.token_standard === "ERC20") {
            await handleFullSyncERC20(enabledSnapshot.token_data, closestBlock, targetTimestamp, closestBlockInfo.timestamp);
          } 
          // else if(enabledSnapshot.token_data.token_standard === "ERC721") {
          //   await handleCheckpointSyncERC721(enabledSnapshot.token_data);
          // } else if(enabledSnapshot.token_data.token_standard === "ERC1155") {
          //   await handleCheckpointSyncERC1155(enabledSnapshot.token_data);
          // }
        }
      }
    } catch (e) {
        console.log(e);
    }

    process.exit();
}

run();