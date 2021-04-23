const {UserModel} = require("./../models");
const BaseRepository = require("./BaseRepository");
const {raw} = require('objection');
const Knex = require("knex");

class AuthRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return UserModel
    }

    async findUsername(username) {
        const result = await this.model.query()
            .where('username', username)
            .first();

        if (!result) {
            return null;
        }

        return this.parserResult(result)
    }

}

module.exports = new AuthRepository()
