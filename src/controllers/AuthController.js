const Controller = require('./Controller');
const jwt = require('jsonwebtoken');
const {UserRepository} = require("./../repositories");
const Web3Helper = require("./../utils/Web3Helper");
const {JWT_SECRET} = require("../config");
const PasswordHelper = require("../utils/PasswordHelper")

class AuthController extends Controller {

    async login(req, res) {
        // Read username and password from request body
        const {wallet, password} = req.body;

        // Filter user from the users array by username and password
        const user = await UserRepository.findByColumn('wallet', wallet);

        if (user.password !== PasswordHelper.getHashedPassword(password)) {
            this.sendResponse(res, null, "Username or password incorrect");
            return;
        }

        // Generate an access token
        const accessToken = jwt.sign({wallet: wallet}, JWT_SECRET, {expiresIn: "2d"});
        this.sendResponse(res, {
            accessToken
        });
    }
}

module.exports = AuthController;
