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
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let supply = await contract.methods.supply().call();

        return parseInt(supply) === 0;
    }

    async isAuctionOver() {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let startBidTide = await contract.methods.startBidTime().call();
        let auctionLength = await contract.methods.auctionLength().call();
        let endDate = new Date((parseInt(startBidTide) + parseInt(auctionLength)) * 1000);

        return new Date() > endDate;
    }


    async isAuctionOverV2() {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let endTime = await contract.methods.endTime().call();
        if(parseInt(endTime) === 0) {
            return false; // Reserve price auctions do not have an endTime set until the reserve price is hit
        }
        let endDate = new Date((parseInt(endTime)) * 1000);
        let now = new Date();
        now.setHours(now.getHours() - 1)
        return now > endDate;
    }

    async getWinningAddress() {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.winning().call();
    }

}

module.exports = Web3Service;
