const axios = require('axios');

const seenV3NFTABI = require("../abis/v3/seenHausNFTABI.json");
const Web3Service = require("../services/web3.service");
const { 
  networkNameToSeenNFT,
} = require('../constants/ContractAddressesV3');
const {
  seenHausIpfsGateway
} = require('../constants/IPFS');

const getSeenHausV3NFTMetadata = async (tokenId) => {
  const useNetwork = process.env.ETH_NETWORK ? process.env.ETH_NETWORK : "mainnet";
  const seenHausNFTContractService = new Web3Service(networkNameToSeenNFT[useNetwork], seenV3NFTABI);
  try {
    let response = await seenHausNFTContractService.uri(tokenId);
    console.log({response})
    let ipfsHash = response.split('ipfs://')[1];
    console.log({ipfsHash})
    if(ipfsHash) {
      let metaData = await axios.get(seenHausIpfsGateway + ipfsHash).then(gatewayResponse => gatewayResponse.data);
      console.log({metaData})
      return metaData;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}

const getSeenHausV3NFTTangibility = async (tokenId) => {
  const useNetwork = process.env.ETH_NETWORK ? process.env.ETH_NETWORK : "mainnet";
  const seenHausNFTContractService = new Web3Service(networkNameToSeenNFT[useNetwork], seenV3NFTABI);
  try {
    let response = await seenHausNFTContractService.isPhysical(tokenId);
    if(response === false) {
      return 'nft'
    } else if (response === true) {
      return 'tangible_nft'
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}

module.exports = {
  getSeenHausV3NFTMetadata,
  getSeenHausV3NFTTangibility,
}