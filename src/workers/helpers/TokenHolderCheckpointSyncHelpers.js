const Knex = require("knex");
const {Model} = require("objection");

const {dbConfig} = require("../../config");

const ethers = require('ethers');
const axios = require('axios');
const BigNumber = require('bignumber.js');

const {
  TokenHolderBlockTrackerRepository,
  TokenCacheRepository,
  TicketCacheRepository,
} = require("../../repositories/index");

const Web3Service = require('../../services/web3.service');

const ERC20ABI = require('../../abis/erc20.json');
const ERC721ABI = require('../../abis/erc721Enumerable.json');
const ERC1155ABI = require('../../abis/erc1155.json');

const { sleep } = require('../../utils/MiscHelpers');

const knex = Knex(dbConfig)
Model.knex(knex)

const handleCheckpointSyncERC20 = async (enabledTracker) => {

  let tokenAddress = enabledTracker.token_address;

  // Check current lock status
  let currentTrackerState = await TokenHolderBlockTrackerRepository.getTrackerByTokenAddress(tokenAddress);

  if(!currentTrackerState.is_busy_lock) {
    // Lock the record
    await TokenHolderBlockTrackerRepository.lockTrackerByTokenAddress(tokenAddress);

    let tokenContract = new Web3Service(tokenAddress, ERC20ABI);
    let blockNumber = await tokenContract.getRecentBlock();
    let lastCheckedBlockNumber = enabledTracker.latest_checked_block;
    console.log({lastCheckedBlockNumber})
    if(lastCheckedBlockNumber > 0 && (blockNumber !== lastCheckedBlockNumber)) {
      let startBlock = lastCheckedBlockNumber + 1;
      console.log(`ERC20: Checkpoint syncing ${tokenAddress}`)
      // Use events to do a checkpoint sync (i.e. adjust balances using transfer events since last checked block)
      // event Transfer(address indexed _from, address indexed _to, uint256 _value);
      let eventsTransfer = await tokenContract.findEvents('Transfer', true, false, startBlock, blockNumber);
      console.log('got transfer events')

      // Sorts by blockNumber, then by transactionIndex within each block, then by logIndex within each transaction on each block
      let mergedAndSortedEvents = [...eventsTransfer].sort((a, b) => {

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
        console.log(`Handling event at block: ${event.blockNumber}`);
        let { from, to, value } = event.returnValues;
        value = new BigNumber(value);

        if(from === '0x0000000000000000000000000000000000000000') {
          // is a minting event, has no existing holder to reduce value on, increase value of `to`
          if(value.isGreaterThan(new BigNumber(0))) {
            // event Transfer
            // increase value of `to`
            // increaseFungibleTokenHolderBalance method creates record if there isn't an existing balance to modify
            await TokenCacheRepository.increaseFungibleTokenHolderBalance(to, tokenAddress, value.toString());
          }
        } else {
          // is a transfer from an existing holder to another address, reduce value of `from`, increase value of `to`
          if(value.isGreaterThan(new BigNumber(0))) {
            // event TransferSingle
            // decrease value of `from`
            await TokenCacheRepository.decreaseFungibleTokenHolderBalance(from, tokenAddress, value.toString());
            // increase value of `to`
            await TokenCacheRepository.increaseFungibleTokenHolderBalance(to, tokenAddress, value.toString());
          }
        }
      }
      // Update latest checked block
      await TokenHolderBlockTrackerRepository.updateBlockNumberByTokenAddress(tokenAddress, blockNumber)
    }
    // Unlock the record
    await TokenHolderBlockTrackerRepository.unlockTrackerByTokenAddress(tokenAddress);
  } else {
    // Sleep in case the current busy process finishes during the wait
    await sleep(3000)
  }
}

const handleCheckpointSyncERC721 = async (enabledTracker) => {
  let tokenAddress = enabledTracker.token_address;

  // Check current lock status
  let currentTrackerState = await TokenHolderBlockTrackerRepository.getTrackerByTokenAddress(tokenAddress);

  if(!currentTrackerState.is_busy_lock) {
    // Lock the record
    await TokenHolderBlockTrackerRepository.lockTrackerByTokenAddress(tokenAddress);

    let tokenContract = new Web3Service(tokenAddress, ERC721ABI);
    let blockNumber = await tokenContract.getRecentBlock();
    let lastCheckedBlockNumber = currentTrackerState.latest_checked_block;
    if(lastCheckedBlockNumber > 0 && (blockNumber !== lastCheckedBlockNumber)) {
      console.log(`ERC721: Checkpoint syncing ${tokenAddress}`)
      let startBlock = lastCheckedBlockNumber + 1;
      // Use events to do a checkpoint sync (i.e. adjust balances using transfer events since last checked block)
      let event = 'Transfer';
      let events = await tokenContract.findEvents(event, true, false, startBlock, blockNumber);
      for(event of events) {
        let { from, to, tokenId } = event.returnValues;
        // Check if we already have a record of this tokenId
        const currentRecord = TokenCacheRepository.findByTokenAddressAndId(tokenAddress, tokenId);
        if(currentRecord) {
          // Reassign ownership of token ID from `from` to `to`
          console.log(`ERC721: Reassigning ownership of ${tokenId} of ${tokenAddress} from ${from} to ${to}`);
          await TokenCacheRepository.patchHolderByTokenAddressAndIdERC721(to, tokenAddress, tokenId);
        } else {
          let tokenURI = await tokenContract.tokenURI(tokenId);
          // fetch token metadata
          let metadataResponse = await axios.get(tokenURI);
          if(metadataResponse.data) {
            // Run a create for a new record
            console.log(`ERC721: Assigning ownership of ${tokenId} of ${tokenAddress} to ${to}`);
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
    
    // Unlock the record
    await TokenHolderBlockTrackerRepository.unlockTrackerByTokenAddress(tokenAddress);
  } else {
    // Sleep in case the current busy process finishes during the wait
    await sleep(3000)
  }
}

const handleCheckpointSyncERC1155 = async (enabledTracker) => {

  let tokenAddress = enabledTracker.token_address;

  // Check current lock status
  let currentTrackerState = await TokenHolderBlockTrackerRepository.getTrackerByTokenAddress(tokenAddress);

  if(!currentTrackerState.is_busy_lock) {
    // Lock the record
    await TokenHolderBlockTrackerRepository.lockTrackerByTokenAddress(tokenAddress);

    let tokenContract = new Web3Service(tokenAddress, ERC1155ABI);
    let blockNumber = await tokenContract.getRecentBlock();
    let lastCheckedBlockNumber = enabledTracker.latest_checked_block;
    console.log({lastCheckedBlockNumber})
    if(lastCheckedBlockNumber > 0 && (blockNumber !== lastCheckedBlockNumber)) {
      let startBlock = lastCheckedBlockNumber + 1;
      console.log(`ERC1155: Checkpoint syncing ${tokenAddress}`)
      // Use events to do a checkpoint sync (i.e. adjust balances using transfer events since last checked block)
      // event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);
      let eventsTransferSingle = await tokenContract.findEvents('TransferSingle', true, false, startBlock, blockNumber);
      console.log('got transfer events single')
      // event TransferBatch(address indexed _operator, address indexed _from, address indexed _to, uint256[] _ids, uint256[] _values);
      let eventsTransferBatch = await tokenContract.findEvents('TransferBatch', true, false, startBlock, blockNumber);
      console.log('got transfer events batch')

      if(enabledTracker.is_ticketer) {
        // Associate consignment ID with each token ID
        // event TicketIssued(uint256 ticketId, uint256 indexed consignmentId, address indexed buyer, uint256 amount);
        let eventsTicketIssued = await tokenContract.findEvents('TicketIssued', true, false, startBlock, blockNumber);
        console.log('got ticket issued events')
        for(let eventTicketIssued of eventsTicketIssued) {
          let { consignmentId, ticketId, amount } = eventTicketIssued.returnValues;
          for(let entry of Array.from({length: Number(amount)})) {
            console.log(`Creating new ticket token_address = ${tokenAddress}, token_id = ${ticketId}, consignment_id = ${consignmentId}`)
            await TicketCacheRepository.create({
              token_address: tokenAddress,
              token_id: ticketId,
              consignment_id: consignmentId
            })
          }
        }
        let eventsTicketClaimed = await tokenContract.findEvents('TicketClaimed', true, false, startBlock, blockNumber);
        console.log('got ticket claimed events')
        for(let eventTicketClaimed of eventsTicketClaimed) {
          let { ticketId, claimant, amount } = eventTicketClaimed.returnValues;
          for(let entry of Array.from({length: Number(amount)})) {
            console.log(`Assigning burnt token_address = ${tokenAddress}, token_id = ${ticketId}, claimant = ${claimant}`)
            // assign burner field of one unburnt token record to the claimant
            await TicketCacheRepository.assignBurntByToOneUnburnt(tokenAddress, ticketId, claimant);
          }
        }
      }

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
        console.log(`Handling event at block: ${event.blockNumber}`);
        let { from, to, id, value, ids, values } = event.returnValues;
        value = new BigNumber(value);

        if(from === '0x0000000000000000000000000000000000000000') {
          // is a minting event, has no existing holder to reduce value on, increase value of `to`
          if(id && value.isGreaterThan(new BigNumber(0))) {
            // event TransferSingle
            // increase value of `to`
            // increaseNonFungibleTokenHolderBalance method creates record if there isn't an existing balance to modify
            await TokenCacheRepository.increaseNonFungibleTokenHolderBalance(to, tokenAddress, id, value.toString());
          } else if(ids && values) {
            // event TransferBatch
            let valueIndex = 0;
            for(let singleId of ids) {
              let singleValue = new BigNumber(values[valueIndex]);
              // rewrite to DB method
              await TokenCacheRepository.increaseNonFungibleTokenHolderBalance(to, tokenAddress, singleId, singleValue.toString());
              valueIndex++;
            }
          }
        } else {
          // is a transfer from an existing holder to another address, reduce value of `from`, increase value of `to`
          if(id && value.isGreaterThan(new BigNumber(0))) {
            // event TransferSingle
            // decrease value of `from`
            await TokenCacheRepository.decreaseNonFungibleTokenHolderBalance(from, tokenAddress, id, value.toString());
            // increase value of `to`
            await TokenCacheRepository.increaseNonFungibleTokenHolderBalance(to, tokenAddress, id, value.toString());
          } else if(ids && values) {
            // event TransferBatch
            let valueIndex = 0;
            for(let singleId of ids) {
              let singleValue = new BigNumber(values[valueIndex]);
              // decrease value of `from`
              await TokenCacheRepository.decreaseNonFungibleTokenHolderBalance(from, tokenAddress, singleId, singleValue.toString());
              // increase value of `to`
              await TokenCacheRepository.increaseNonFungibleTokenHolderBalance(to, tokenAddress, singleId, singleValue.toString());
              valueIndex++;
            }
          }
        }
        // adjust ticket token data if relevant
        if(enabledTracker.is_ticketer) {
          if(id && value.isGreaterThan(new BigNumber(0))) {
            // Get consignment ID associated with tokenId
            let ticket = await TicketCacheRepository.findByTokenAddressAndId(tokenAddress, id);
            let useConsignmentId = ticket.consignment_id !== null ? ticket.consignment_id : null;
            if(useConsignmentId !== null) {
              await TokenCacheRepository.updateTicketTokenInfo(tokenAddress, id, useConsignmentId)
            }
          } else if(ids && values) {
            let valueIndex = 0;
            for(let singleId of ids) {
              let ticket = await TicketCacheRepository.findByTokenAddressAndId(tokenAddress, singleId);
              let useConsignmentId = ticket.consignment_id !== null ? ticket.consignment_id : null;
              if(useConsignmentId !== null) {
                await TokenCacheRepository.updateTicketTokenInfo(tokenAddress, singleId, useConsignmentId)
              }
              valueIndex++;
            }
          }
        }
      }
      // Update latest checked block
      await TokenHolderBlockTrackerRepository.updateBlockNumberByTokenAddress(tokenAddress, blockNumber)
    }
    // Unlock the record
    await TokenHolderBlockTrackerRepository.unlockTrackerByTokenAddress(tokenAddress);
  } else {
    // Sleep in case the current busy process finishes during the wait
    await sleep(3000)
  }
}

module.exports = {
  handleCheckpointSyncERC20,
  handleCheckpointSyncERC721,
  handleCheckpointSyncERC1155,
}