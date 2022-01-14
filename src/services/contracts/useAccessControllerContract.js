
const { networkNameToAccessController } = require('./../../constants/ContractAddressesV3');
const accessControllerABI = require('./../../abis/v3/accessControllerABI.json');
const ChainTypes = require('./../../constants/ChainTypes');
const RoleTypes = require('./../../constants/RoleTypes');
const useContract = require('./useContract');

const ethers = require('ethers');
const keccak256 = ethers.utils.keccak256;
const toUtf8Bytes = ethers.utils.toUtf8Bytes;

const roleTypeToBytes = {
    [RoleTypes.SELLER]: keccak256(toUtf8Bytes(RoleTypes.SELLER)),
    [RoleTypes.MINTER]: keccak256(toUtf8Bytes(RoleTypes.MINTER)),
    [RoleTypes.ESCROW_AGENT]: keccak256(toUtf8Bytes(RoleTypes.ESCROW_AGENT)),
}

const useAccessControllerContract = () => {
    const useNetwork = process.env.ETH_NETWORK ? process.env.ETH_NETWORK : ChainTypes.ETHEREUM_MAINNET;
    const contract = useContract(accessControllerABI, networkNameToAccessController[useNetwork]);
    
    const hasRole = async (roleType, address) => {
        return await contract.methods.hasRole(roleTypeToBytes[roleType], address).call();
    }

    return {
        hasRole,
    };
}

module.exports = useAccessControllerContract;