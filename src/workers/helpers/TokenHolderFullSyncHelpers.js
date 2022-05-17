const Knex = require("knex");
const {Model} = require("objection");

const {dbConfig} = require("../../config");

const ethers = require('ethers');
const axios = require('axios');
const BigNumber = require('bignumber.js');

const {
  TokenHolderBlockTrackerRepository,
  TokenCacheRepository
} = require("../../repositories/index");

const Web3Service = require('../../services/web3.service');

const ERC721ABI = require('../../abis/erc721Enumerable.json');
const ERC1155ABI = require('../../abis/erc1155.json');

const knex = Knex(dbConfig)
Model.knex(knex)

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const handleFullSync721 = async (enabledTracker) => {
  let tokenAddress = enabledTracker.token_address;

  // Check current lock status
  let currentTrackerState = await TokenHolderBlockTrackerRepository.getTrackerByTokenAddress(tokenAddress);

  if(!currentTrackerState.is_busy_lock) {
    // Lock the record
    await TokenHolderBlockTrackerRepository.lockTrackerByTokenAddress(tokenAddress);

    let tokenAddress = enabledTracker.token_address;
    let tokenContract = new Web3Service(tokenAddress, ERC721ABI);
    let blockNumber = await tokenContract.getRecentBlock();
    let lastCheckedBlockNumber = enabledTracker.latest_checked_block;
    if(!lastCheckedBlockNumber) {
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
              token_balance: 1,
              metadata: JSON.stringify(metadataResponse.data)
            })
          }
        }
      }
      // Update latest checked block
      await TokenHolderBlockTrackerRepository.updateBlockNumberByTokenAddress(tokenAddress, blockNumber)
    }
    await TokenHolderBlockTrackerRepository.unlockTrackerByTokenAddress(tokenAddress);
  }
}

const handleFullSync1155 = async (enabledTracker) => {
  let tokenAddress = enabledTracker.token_address;

  // Check current lock status
  let currentTrackerState = await TokenHolderBlockTrackerRepository.getTrackerByTokenAddress(tokenAddress);

  if(!currentTrackerState.is_busy_lock) {
    // Lock the record
    await TokenHolderBlockTrackerRepository.lockTrackerByTokenAddress(tokenAddress);

    let tokenContract = new Web3Service(tokenAddress, ERC1155ABI);
    let blockNumber = await tokenContract.getRecentBlock();
    let lastCheckedBlockNumber = enabledTracker.latest_checked_block;
    if(!lastCheckedBlockNumber) {
      // Do full check for all balances at a specific block (all checks must be at the same block)

      // event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);
      let eventsTransferSingle = await tokenContract.findEvents('TransferSingle', true, false, false, blockNumber);
      console.log('got transfer events single')
      // event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values);
      let eventsTransferBatch = await tokenContract.findEvents('TransferBatch', true, false, false, blockNumber);
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

      console.log('sorted transfer events')

      let holders = {};

      for(let event of mergedAndSortedEvents) {
        let { from, to, id, value, ids, values } = event.returnValues;
        value = new BigNumber(value);

        if(from === '0x0000000000000000000000000000000000000000') {
          // is a minting event, has no existing holder to reduce value on, increase value of `to`
          if(id && value.isGreaterThan(new BigNumber(0))) {
            // event TransferSingle
            // increase value of `to`
            if(holders[to]) {
              if(holders[to][id]) {
                holders[to][id] = new BigNumber(holders[to][id]).plus(value).toString();
              } else {
                holders[to][id] = value.toString();
              }
            } else {
              holders[to] = {};
              holders[to][id] = value.toString();
            }
          } else if(ids && values) {
            // event TransferBatch
            let valueIndex = 0;
            for(let singleId of ids) {
              let singleValue = new BigNumber(values[valueIndex]);
              if(holders[to]) {
                if(holders[to][singleId]) {
                  holders[to][singleId] = new BigNumber(holders[to][singleId]).plus(singleValue).toString();
                } else {
                  holders[to][singleId] = singleValue.toString();
                }
              } else {
                holders[to] = {};
                holders[to][singleId] = singleValue.toString();
              }
              valueIndex++;
            }
          }
        } else {
          // is a transfer from an existing holder to another address, reduce value of `from`, increase value of `to`
          if(id && value.isGreaterThan(new BigNumber(0))) {
            // event TransferSingle
            // decrease value of `from`
            holders[from][id] = new BigNumber(holders[from][id]).minus(value).toString();

            // increase value of `to`
            if(holders[to]) {
              if(holders[to][id]) {
                holders[to][id] = new BigNumber(holders[to][id]).plus(value).toString();
              } else {
                holders[to][id] = value.toString();
              }
            } else {
              holders[to] = {};
              holders[to][id] = value.toString();
            }
          } else if(ids && values) {
            // event TransferBatch
            let valueIndex = 0;
            for(let singleId of ids) {
              let singleValue = new BigNumber(values[valueIndex]);
              // decrease value of `from`
              holders[from][singleId] = new BigNumber(holders[from][singleId]).minus(singleValue).toString();

              // increase value of `to`
              if(holders[to]) {
                if(holders[to][singleId]) {
                  holders[to][singleId] = new BigNumber(holders[to][singleId]).plus(singleValue).toString();
                } else {
                  holders[to][singleId] = singleValue.toString();
                }
              } else {
                holders[to] = {};
                holders[to][singleId] = singleValue.toString();
              }
              valueIndex++;
            } 
          }
        }
      }

      console.log('determined holder balances');

      let tokenIdToConsignmentId = {};
      let tokenIdToBurntByAddress = {};
      if(enabledTracker.is_ticketer) {
        // Associate consignment ID with each token ID
        // event TicketIssued(uint256 ticketId, uint256 indexed consignmentId, address indexed buyer, uint256 amount);
        let eventsTicketIssued = await tokenContract.findEvents('TicketIssued', true, false, false, blockNumber);
        console.log('got ticket issued events')
        for(let eventTicketIssued of eventsTicketIssued) {
          let { consignmentId, ticketId } = eventTicketIssued.returnValues;
          tokenIdToConsignmentId[ticketId] = consignmentId;
        }
        let eventsTicketClaimed = await tokenContract.findEvents('TicketClaimed', true, false, false, blockNumber);
        console.log('got ticket claimed events')
        for(let eventTicketClaimed of eventsTicketClaimed) {
          let { ticketId, claimant } = eventTicketClaimed.returnValues;
          tokenIdToBurntByAddress[ticketId] = claimant;
        }
      }

      // console.log({holders, tokenIds})

      // TODO: Separate Metadata loading into a separate script

      // let tokenMetadata = {};

      // for(let tokenId of tokenIds) {
      //   // Fetch token metadata
      //   let tokenURI = await tokenContract.uri(tokenId);
      //   if(tokenURI.indexOf('ipfs://ipfs/') > -1) {
      //     tokenURI = tokenURI.replace('ipfs://ipfs/', 'https://seenhaus.mypinata.cloud/ipfs/');
      //   } else if (tokenURI.indexOf('ipfs://') > -1) {
      //     tokenURI = tokenURI.replace('ipfs://', 'https://seenhaus.mypinata.cloud/ipfs/');
      //   }
      //   console.log(`Fetching metadata for ${tokenId} via ${tokenURI}`);
      //   // fetch token metadata
      //   try {
      //     const metadataTimeout = 10000; // 10 seconds
      //     const abort = axios.CancelToken.source();
      //     const id = setTimeout(
      //       () => {
      //         tokenMetadata[tokenId] = tokenURI;
      //         console.log(`tokenMetadata[tokenId]`, tokenMetadata[tokenId]);
      //         return abort.cancel(`Timeout of ${metadataTimeout}ms.`)
      //       },
      //       metadataTimeout
      //     );
      //     let metadataResponse = await axios.get(tokenURI, {cancelToken: abort.token}).then(response => {
      //       clearTimeout(id)
      //       return response
      //      });
      //     if(metadataResponse.data) {
      //       tokenMetadata[tokenId] = metadataResponse.headers['content-type'] === 'application/json' ? JSON.stringify(metadataResponse.data) : tokenURI;
      //     }
      //   } catch (e) {
      //     // Timed out or couldn't fetch metadata, save tokenURI instead
      //     console.log({e})
      //     tokenMetadata[tokenId] = tokenURI;
      //   }
      // }

      let saneBalances = true;
      let runSanityCheck = false;
      
      if(runSanityCheck) {
        // Derive totalSupply from TransferSingle & TransferBatch events of `from` = 0x0...0
        let mintFilter = { from: '0x0000000000000000000000000000000000000000' };
        // event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);
        let mintEventsTransferSingle = await tokenContract.findEvents('TransferSingle', false, mintFilter, false, blockNumber);
        console.log('got minting events single')
        // event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values);
        let mintEventsTransferBatch = await tokenContract.findEvents('TransferBatch', false, mintFilter, false, blockNumber);
        console.log('got minting events batch')

        // Get all existing token IDs and quantities
        let tokenIds = [];
        for(let mintEvent of mintEventsTransferSingle) {
          tokenIds.push(new BigNumber(mintEvent.id).toString());
        }
        for(let mintEvent of mintEventsTransferBatch) {
          for (let mintedId of mintEvent.ids) {
            tokenIds.push(new BigNumber(mintedId).toString());
          }
        }

        // let missingIds = [];
        // let startId = 1;
        // for(let i = 1; i <= 202; i++) {
        //   if(tokenIds.indexOf(i) === -1) {
        //     missingIds.push(i);
        //   }
        // }
        // console.log({missingIds})

        for(let [holder, idToBalances] of Object.entries(holders)) {
          console.log({holder, idToBalances})
          for(let [tokenId, tokenBalance] of Object.entries(idToBalances)) {
            console.log({tokenId, tokenBalance});
            // Do sanity check on each value
            let sanityBalance = await tokenContract.balanceOf(holder, tokenId);
            if(!(new BigNumber(tokenBalance).isEqualTo(sanityBalance))) {
              saneBalances = false;
            }
            await sleep(500);
          }
        }
      }

      if(saneBalances) {
        // clear existing balances before saving new balances
        await TokenCacheRepository.clearTokenCacheByTokenAddress(tokenAddress);
        for(let [holder, idToBalances] of Object.entries(holders)) {
          for(let [tokenId, tokenBalance] of Object.entries(idToBalances)) {
            if(new BigNumber(tokenBalance).isGreaterThan(new BigNumber(0))) {
              console.log(`ERC1155: Assigning ownership of ${tokenBalance} units of ${tokenId} of ${tokenAddress} to ${holder}`);
              // Passes sanity check, save balance
              await TokenCacheRepository.create({
                token_address: tokenAddress,
                token_id: tokenId,
                token_holder: holder,
                token_balance: tokenBalance,
                ...(enabledTracker.is_ticketer && {
                  consignment_id: tokenIdToConsignmentId[tokenId]
                }),
                ...(enabledTracker.is_ticketer && tokenIdToBurntByAddress[tokenId] && {
                  burnt_by_address: tokenIdToBurntByAddress[tokenId]
                })
              });
            }
          }
        }
        // Update latest checked block
        await TokenHolderBlockTrackerRepository.updateBlockNumberByTokenAddress(tokenAddress, blockNumber)
      }

    }
    await TokenHolderBlockTrackerRepository.unlockTrackerByTokenAddress(tokenAddress);
  }
}

module.exports = {
  handleFullSync721,
  handleFullSync1155,
}