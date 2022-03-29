const Knex = require("knex");
const ethers = require('ethers');
const {Model} = require("objection");
const axios = require('axios');
const BigNumber = require('bignumber.js');

const {dbConfig} = require("./../config");
const {
    TokenHolderBlockTrackerRepository,
    TokenCacheRepository
} = require("./../repositories/index");
const Web3Service = require('./../services/web3.service');

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
            console.log(`ERC721: Checkpoint syncing ${tokenAddress}`)
            // Use events to do a checkpoint sync (i.e. adjust balances using transfer events since last checked block)
            let event = 'Transfer';
            let events = await tokenContract.findEvents(event, true, false, lastCheckedBlockNumber, blockNumber);
            for(event of events) {
              let { from, to, tokenId } = event.returnValues;
              // Check if we already have a record of this tokenId
              const currentRecord = TokenCacheRepository.findByTokenAddressAndId(tokenAddress, tokenId);
              if(currentRecord) {
                // Reassign ownership of token ID from `from` to `to`
                console.log(`Reassigning ownership of ${tokenId} of ${tokenAddress} from ${from} to ${to}`);
                await TokenCacheRepository.patchHolderByTokenAddressAndIdERC721(to, tokenAddress, tokenId);
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
          }
        } else if(enabledTracker.token_standard === "ERC1155") {
          let tokenContract = new Web3Service(tokenAddress, ERC1155ABI);
          let blockNumber = await tokenContract.getRecentBlock();
          let lastCheckedBlockNumber = enabledTracker.latest_checked_block;
          if(lastCheckedBlockNumber > 0) {
            console.log(`ERC1155: Checkpoint syncing ${tokenAddress}`)
            // Use events to do a checkpoint sync (i.e. adjust balances using transfer events since last checked block)
            // event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);
            let eventsTransferSingle = await tokenContract.findEvents('TransferSingle', true, false, lastCheckedBlockNumber, blockNumber);
            console.log('got transfer events single')
            // event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values);
            let eventsTransferBatch = await tokenContract.findEvents('TransferBatch', true, false, lastCheckedBlockNumber, blockNumber);
            console.log('got transfer events batch')

            // Sorts by blockNumber, then by transactionIndex within each block, then by logIndex within each transaction on each block
            let mergedAndSortedEvents = [...eventsTransferSingle, ...eventsTransferBatch].sort((a, b) => {

              let resultBlockNumber = 
                new BigNumber(a.blockNumber).isEqualTo(new BigNumber(b.blockNumber)) 
                  ? 0 
                  : new BigNumber(a.blockNumber).isGreaterThan(new BigNumber(b.blockNumber))
                    ? 1
                    : -1;
      
              let resultTransactionIndex = 
                new BigNumber(a.transactionIndex).isEqualTo(new BigNumber(b.transactionIndex)) 
                  ? 0 
                  : new BigNumber(a.transactionIndex).isGreaterThan(new BigNumber(b.transactionIndex))
                    ? 1
                    : -1;
      
              let resultLogIndex = 
                new BigNumber(a.logIndex).isEqualTo(new BigNumber(b.logIndex)) 
                  ? 0 
                  : new BigNumber(a.logIndex).isGreaterThan(new BigNumber(b.logIndex))
                    ? 1
                    : -1;
      
              return resultBlockNumber || resultTransactionIndex || resultLogIndex;
            })

            for(let event of mergedAndSortedEvents) {
              let { from, to, id, value, ids, values } = event.returnValues;
              value = new BigNumber(value);

              if(from === '0x0000000000000000000000000000000000000000') {
                // is a minting event, has no existing holder to reduce value on, increase value of `to`
                if(id && value.isGreaterThan(new BigNumber(0))) {
                  // event TransferSingle
                  // increase value of `to`
                  // increaseTokenHolderBalance method creates record if there isn't an existing balance to modify
                  await TokenCacheRepository.increaseTokenHolderBalance(to, tokenAddress, id, value.toString());
                } else if(ids && values) {
                  // event TransferBatch
                  let valueIndex = 0;
                  for(let singleId of ids) {
                    let singleValue = new BigNumber(values[valueIndex]);
                    // rewrite to DB method
                    await TokenCacheRepository.increaseTokenHolderBalance(to, tokenAddress, singleId, singleValue.toString());
                    valueIndex++;
                  }
                }
              } else {
                // is a transfer from an existing holder to another address, reduce value of `from`, increase value of `to`
                if(id && value.isGreaterThan(new BigNumber(0))) {
                  // event TransferSingle
                  // decrease value of `from`
                  await TokenCacheRepository.decreaseTokenHolderBalance(from, tokenAddress, id, value.toString());
                  // increase value of `to`
                  await TokenCacheRepository.increaseTokenHolderBalance(to, tokenAddress, id, value.toString());
                } else if(ids && values) {
                  // event TransferBatch
                  let valueIndex = 0;
                  for(let singleId of ids) {
                    let singleValue = new BigNumber(values[valueIndex]);
                    // decrease value of `from`
                    await TokenCacheRepository.decreaseTokenHolderBalance(from, tokenAddress, singleId, singleValue.toString());
                    // increase value of `to`
                    await TokenCacheRepository.increaseTokenHolderBalance(to, tokenAddress, singleId, singleValue.toString());
                    valueIndex++;
                  }
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