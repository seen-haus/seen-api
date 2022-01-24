const Watcher = require("../Watcher");
const PurchaseEventHandler = require("../../../handlers/v3/PurchaseEventHandler");
const { INFURA_PROVIDER } = require("../../../config");
const Web3 = require('web3');
const ABI = require("./../../../abis/v3/saleRunnerABI.json");

module.exports = class CollectableAuction extends Watcher {
    constructor(collectable) {
        super(collectable);
        this.abi = ABI;
    }

    async handlePurchaseEvent(evt) {
        await (new PurchaseEventHandler(this.collectable)).handle(evt);
        return true;
    }

    async destroy() {
        console.log("=== DESTROY EVENTS ===", this.collectable.title, this.collectable.id);
        if (this.purchaseSubscription) {
            try {
                await this.purchaseSubscription.unsubscribe()
                this.purchaseSubscription = null
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
        console.log({ "Contract": this.collectable.contract_address, "Consignment ID": this.collectable.consignment_id })
        let contract = new web3.eth.Contract(this.abi, this.collectable.contract_address)
        if (!this.purchaseSubscription && this.collectable.consignment_id) {
            console.log("purchaseSubscription INITIALIZE for  ", this.collectable.title, this.collectable.id)
            this.purchaseSubscription = contract.events.Purchase({filter: {consignmentId: this.collectable.consignment_id.toString()}})
                .on('data', this.handlePurchaseEvent.bind(this))
                .on('error', this.handleError.bind(this));
        }

        console.log("Worker for ", this.collectable.title, this.collectable.id, " initialized")
    }

}
