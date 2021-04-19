const Watcher = require("../Watcher");
const BuyEventHandler = require("../../../handlers/v1/BuyEventHandler");
const {INFURA_PROVIDER} = require("../../../config");
const Web3 = require('web3');
const ABI = require("./../../../abis/v1/NFTSale.json");

module.exports = class CollectableSaleV1 extends Watcher {
    constructor(collectable) {
        super(collectable);
        this.abi = ABI;
    }

    async handleBuyEvent(evt) {
        await (new BuyEventHandler(this.collectable)).handle(evt)
        return true;
    }

    async destroy() {
        console.log("=== DESTROY EVENTS ===", this.collectable.title, this.collectable.id)
        if (this.buySubscription) {
            try {
                await this.buySubscription.unsubscribe()
                this.buySubscription = null
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
        const web3 = new Web3(INFURA_PROVIDER);
        console.log("contract", this.collectable.contract_address)
        const contract = new web3.eth.Contract(this.abi, this.collectable.contract_address)
        if (!this.buySubscription) {
            console.log("INITIALIZE buySubscription collectable  ", this.collectable.id)
            this.buySubscription = contract.events.Buy({})
                .on('data', this.handleBuyEvent.bind(this))
                .on('error', this.handleError.bind(this));
        }

        console.log("Worker for ", this.collectable.title, this.collectable.id, " initialized")
    }

}
