const {UserModel} = require("./../models");
const BaseRepository = require("./BaseRepository");
const {raw} = require('objection');
const Knex = require("knex");

class UserRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return UserModel
    }

    async findByAddress(walletAddress) {
        const result = await this.model.query()
            .where('wallet_address', walletAddress)
            .first();

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }

    async findByUsername(username) {
        const result = await this.model.query()
            .where('username', username)
            .first();

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }

    async findEmailByAddress(walletAddress) {
        const result = await this.model.query()
            .where('wallet_address', walletAddress)
            .first();

        if (!result || !result.email) {
            return false;
        }

        return result.email;
    }

}

module.exports = new UserRepository()
