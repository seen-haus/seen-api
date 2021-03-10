const Controller = require('./Controller');
const {SpotlightRepository} = require("./../repositories");


class AdminSpotlightController extends Controller {

    async index(req, res) {
        const data = await SpotlightRepository.query().orderBy('id', 'DESC');
        this.sendResponse(res, data);
    }
}

module.exports = AdminSpotlightController;
