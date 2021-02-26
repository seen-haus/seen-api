const Controller = require('./Controller');
const {SpotlightRepository} = require("./../repositories");
const {body, validationResult} = require('express-validator');

class SpotlightController extends Controller {
    async submit(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return this.sendResponse(res, {errors: errors.array()}, "Validation error", 422);
        }

        const {
            email,
            name,
            socials,
            info,
            work,
            phone
        } = req.body;

        SpotlightRepository
            .create({
                email,
                name,
                socials,
                info,
                work,
                phone
            })
            .catch(e => {
                console.error(e);
                return false;
            });

        this.sendResponse(res, {status: 'Success'});
    }

}

module.exports = SpotlightController;
