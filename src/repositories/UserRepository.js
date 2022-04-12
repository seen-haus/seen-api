const {UserModel} = require("./../models");
const Pagination = require("./../utils/Pagination");
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
            .where('wallet', walletAddress)
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
            .where('wallet', walletAddress)
            .first();

        if (!result || !result.email) {
            return false;
        }

        return result.email;
    }

    async paginateCreators(perPage = 10, page = 1) {
        const results = await this.model.query().whereExists(
            this.model.relatedQuery('collectables')
        ).page(page - 1, perPage)

        return this.parserResult(new Pagination(results, perPage, page))
    }

}

module.exports = new UserRepository()
