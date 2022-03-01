const Web3 = require('web3');
const Web3WsProvider = require('web3-providers-ws');
const { INFURA_PROVIDER } = require("./../../config");

const useContract = (contractABI, contractAddress) => {
    const provider = new Web3WsProvider(INFURA_PROVIDER, {
        clientConfig: {
            maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
            maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
        },
    });
    const service = new Web3(provider);

    return new service.eth.Contract(contractABI, contractAddress);
}

module.exports = useContract;