const {INFURA_PROVIDER, START_BLOCK} = require("./../config");
const Web3 = require('web3');
var Web3WsProvider = require('web3-providers-ws');

class Web3Service {
    constructor(contractAddress, abi) {
        this.contractAddress = contractAddress
        this.abi = abi
        const provider = new Web3WsProvider(INFURA_PROVIDER, {
            clientConfig: {
                maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
                maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
            },
        })
        this.web3 = new Web3(provider);
    }

    async findEvents(event, raw = true) {
        let contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let events = await contract.getPastEvents(event, {
            fromBlock: START_BLOCK,
            toBlock: 'latest'
        }).catch(e => {
            console.log(e)
        });
        return raw
            ? events
            : events.map(e => {
                return e.returnValues
            })
    }

    async isSoldOut() {
        let contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let supply = await contract.methods.supply().call();

        return parseInt(supply) === 0;
    }

    async isAuctionOver() {
        /// Implement V2

        return parseInt(supply) === 0;
    }

}

module.exports = Web3Service;
