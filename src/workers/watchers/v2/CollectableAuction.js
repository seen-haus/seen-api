const Watcher = require("../Watcher");
const BidEventHandler = require("../../../handlers/v2/BidEventHandler");
const {INFURA_PROVIDER} = require("../../../config");
const Web3 = require('web3');
const ABI = require("./../../../abis/v1/EnglishAuction.json");

module.exports = class CollectableAuction extends Watcher {
    constructor(collectable) {
        super(collectable);
        this.abi = ABI;
    }

    async handleBidEvent(evt) {
        await (new BidEventHandler(this.collectable)).handle(evt);
        return true;
    }

    async destroy() {
        console.log("=== DESTROY EVENTS ===", this.collectable.title, this.collectable.id);
        if (this.bidSubscription) {
            try {
                await this.bidSubscription.unsubscribe()
                this.bidSubscription = null
            } catch (e) {
                console.log(e);
            }
        }
        return true;
    }

    async handleError(e) {
        await this.destroy();
        this.init();
    }

    init() {
        let web3 = new Web3(INFURA_PROVIDER);
        console.log("contract", this.collectable.contract_address)
        let contract = new web3.eth.Contract(this.abi, this.collectable.contract_address)
        if (!this.bidSubscription) {
            console.log("bidSubscription INITIALIZE for  ", this.collectable.title, this.collectable.id)
            this.bidSubscription = contract.events.Bid({})
                .on('data', this.handleBidEvent.bind(this))
                .on('error', this.handleError.bind(this));
        }

        console.log("Worker for ", this.collectable.title, this.collectable.id, " initialized")
    }

}
