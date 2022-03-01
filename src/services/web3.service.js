const Web3 = require('web3');
var Web3WsProvider = require('web3-providers-ws');
const { INFURA_PROVIDER, START_BLOCK } = require("./../config");
const AuctionStatesV3 = require('../constants/AuctionStatesV3');

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

    async findEvents(event, raw = true, filter = false, overrideStartBlock = false) {
        console.log({filter: filter})
        let contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let events = await contract.getPastEvents(event, {
            fromBlock: overrideStartBlock ? overrideStartBlock : START_BLOCK,
            toBlock: 'latest',
            ...(filter && {filter: filter}),
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

    async isReservationPeriodOver() {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let isClosed = await contract.methods.isReservationPeriodOver().call();

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

    async isAuctionOverV3(consignmentId) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let auctionStruct = await contract.methods.getAuction(consignmentId).call();
        console.log({auctionStruct})

        // Pending reserve, therefore not over
        if(Number(auctionStruct.state) === AuctionStatesV3.PENDING) {
            return false;
        } else if (Number(auctionStruct.state) === AuctionStatesV3.RUNNING) {
            console.log("Is running but might be over")
            // Triggered but not yet ended/closed on chain, however might be "over" by virtue of time being up
            let startTime = auctionStruct.start;
            let duration = auctionStruct.duration;
            let currentTimeUnix = new Date().getTime() / 1000;
            console.log({currentTimeUnix, 'parseInt(startTime) + parseInt(duration)': parseInt(startTime) + parseInt(duration)})
            if(currentTimeUnix > (parseInt(startTime) + parseInt(duration))) {
                // return true; The issue here is that it would send out claim page notifications before the winner has claimed their NFT from the auction
            }
        } else if (Number(auctionStruct.state) === AuctionStatesV3.ENDED) {
            // Ended
            return true;
        }

        return false;
    }

    async isSaleOverV3(consignmentId, consignment, isPhysical, ticketClaimsIssued) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let saleStruct = await contract.methods.getSale(consignmentId).call();
        console.log({saleStruct});
        if(saleStruct) {
            if(Number(saleStruct.state) === 2) {
                return true;
            }
            if(Number(saleStruct.outcome) === 2) {
                return true;
            } else if (Number(saleStruct.outcome) === 0) {
                if(Number(consignment.supply) === Number(consignment.releasedSupply)) {
                    return true;
                } else {
                    if(isPhysical) {
                        if(Number(ticketClaimsIssued) === Number(consignment.releasedSupply)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    async getWinningAddressAuctionV3(consignmentId) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        let auctionStruct = await contract.methods.getAuction(consignmentId).call();
        console.log({'getWinningAddressAuctionV3 auctionStruct': auctionStruct})
        return auctionStruct.buyer;
    }

    async getWinningAddress() {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.winning().call();
    }

    async balanceOf(wallet_address, nft_token_id) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.balanceOf(wallet_address, nft_token_id).call();
    }

    async getConsignment(consignmentId) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.getConsignment(consignmentId).call();
    }

    async getAuction(consignmentId) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.getAuction(consignmentId).call();
    }

    async getSale(consignmentId) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.getSale(consignmentId).call();
    }

    async uri(tokenId) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.uri(tokenId).call();
    }

    async isPhysical(tokenId) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.isPhysical(tokenId).call();
    }

    async getEscrowTicketer(consignmentId) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.getEscrowTicketer(consignmentId).call();
    }

    async getTicketClaimableCount(consignmentId) {
        const contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        return await contract.methods.getTicketClaimableCount(consignmentId).call();
    }
}

module.exports = Web3Service;
