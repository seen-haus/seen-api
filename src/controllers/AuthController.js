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
        const user = await UserRepository.findByColumn('username', wallet);

         if (!user) {
            this.sendResponse(res, null, "Username or password incorrect");
            return;
        }
        let pass = user.password;
         console.log(user)
         console.log(pass, PasswordHelper.getHashedPassword(password))
        if (!pass || pass !== PasswordHelper.getHashedPassword(password)) {
            this.sendResponse(res, null, "Username or password incorrect 2");
            return;
        }

        // Generate an access token
        const accessToken = jwt.sign({username: wallet}, JWT_SECRET, {expiresIn: "2d"});
        this.sendResponse(res, { accessToken });
    }
}

module.exports = AuthController;
