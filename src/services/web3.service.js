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

    async isOpenEditionClosed() {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let isClosed = await contract.methods.isClosed().call();

        return isClosed;
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
        // Important to keep this before checking isLive value
        if(parseInt(endTime) === 0) {
            return false; // Reserve price auctions do not have an endTime set until the reserve price is hit
        }
        // Make sure not to rely on isLive as indicator of auction being over unless endTime is already set on contract (more than zero)
        // as endTime value will be zero (therefore isLive false) before reserve price is hit
        let isLive = await contract.methods.live().call();
        if(isLive === false) {
            return true;
        }
        return false;
    }

    async getWinningAddress() {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.winning().call();
    }

    async balanceOf(wallet_address, nft_token_id) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.balanceOf(wallet_address, nft_token_id).call();
    }

}

module.exports = Web3Service;
