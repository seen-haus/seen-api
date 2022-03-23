const Knex = require("knex");
const ethers = require('ethers');
const {Model} = require("objection");
const axios = require('axios');

const {dbConfig} = require("./../config");
const {
    TokenHolderBlockTrackerRepository,
    TokenCacheRepository
} = require("./../repositories/index");
const Web3Service = require('./../services/web3.service')

const ERC721ABI = require('../abis/erc721Enumerable.json');
const ERC1155ABI = require('../abis/erc1155.json');

// const

// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

const getActiveBalanceTrackers = async () => {
    let activeBalanceTrackers = await TokenHolderBlockTrackerRepository.active();
    return activeBalanceTrackers;
}

/**
 * Keeps track of token holders
 * @return {Promise<void>}
 */
const run = async() => {
    const enabledTrackers = await getActiveBalanceTrackers();

    try {

      for(let enabledTracker of enabledTrackers) {
        let tokenAddress = enabledTracker.token_address;
        if(enabledTracker.token_standard === "ERC721") {
          let tokenContract = new Web3Service(tokenAddress, ERC721ABI);
          let blockNumber = await tokenContract.getRecentBlock();
          let lastCheckedBlockNumber = enabledTracker.latest_checked_block;
          if(lastCheckedBlockNumber > 0) {
            // Use events to do a lighter-weight check than a full check
            let event = 'Transfer';
            let events = await tokenContract.findEvents(event, true, false, lastCheckedBlockNumber, blockNumber);
            for(event of events) {
              let { from, to, tokenId } = event.returnValues;
              // Check if we already have a record of this tokenId
              const currentRecord = TokenCacheRepository.findByTokenAddressAndId(tokenAddress, tokenId);
              if(currentRecord) {
                // Reassign ownership of token ID from `from` to `to`
                console.log(`Reassigning ownership of ${tokenId} of ${tokenAddress} from ${from} to ${to}`);
                await TokenCacheRepository.patchHolderByTokenAddressAndId(to, tokenAddress, tokenId);
              } else {
                let tokenURI = await tokenContract.tokenURI(tokenId);
                // fetch token metadata
                let metadataResponse = await axios.get(tokenURI);
                if(metadataResponse.data) {
                  // Run a create for a new record
                  console.log(`Assigning ownership of ${tokenId} of ${tokenAddress} to ${to}`);
                  await TokenCacheRepository.create({
                    token_address: tokenAddress,
                    token_id: tokenId,
                    token_holder: to,
                    metadata: JSON.stringify(metadataResponse.data)
                  })
                }
              }
            }
            // Update latest checked block
            await TokenHolderBlockTrackerRepository.updateBlockNumberByTokenAddress(tokenAddress, blockNumber)
          } else {
            // Do full check for all balances at a specific block (all checks must be at the same block)
            let firstId = enabledTracker.first_id;
            let totalSupply = enabledTracker.total_supply;
            let lastId = enabledTracker.first_id === 0 ? totalSupply - 1 : totalSupply;
            for(let tokenId = firstId; tokenId <= lastId; tokenId++) {
              let currentHolder = await tokenContract.ownerOf(tokenId, blockNumber);
              // Check if record already exists
              let existingRecord = await TokenCacheRepository.findByTokenAddressAndId(tokenAddress, tokenId);
              if(existingRecord && existingRecord.length > 0) {
                // Run a patch on existing record
                console.log(`Assigning ownership of ${tokenId} of ${tokenAddress} to ${currentHolder}`);
                await TokenCacheRepository.patchHolderByTokenAddressAndId(currentHolder, tokenAddress, tokenId)
              } else {
                let tokenURI = await tokenContract.tokenURI(tokenId);
                // fetch token metadata
                let metadataResponse = await axios.get(tokenURI);
                if(metadataResponse.data) {
                  // Run a create for a new record
                  console.log(`Assigning ownership of ${tokenId} of ${tokenAddress} to ${currentHolder}`);
                  await TokenCacheRepository.create({
                    token_address: tokenAddress,
                    token_id: tokenId,
                    token_holder: currentHolder,
                    metadata: JSON.stringify(metadataResponse.data)
                  })
                }
              }
            }
            // Update latest checked block
            await TokenHolderBlockTrackerRepository.updateBlockNumberByTokenAddress(tokenAddress, blockNumber)
          }
        }
      }
        
    } catch (e) {
        console.log(e);
    }
    process.exit();
}

run();