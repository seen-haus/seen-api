const Controller = require('./Controller');
const categories = require("../constants/Categories");
const collectables = require("../constants/Collectables");
const purchaseTypes = require("../constants/PurchaseTypes");
const versions = require("../constants/Versions");


class AdminConstantsController extends Controller {

    async index(req, res) {
        this.sendResponse(res, {
          categories, collectables, versions, purchaseTypes
        });
    }
}

module.exports = AdminConstantsController;
