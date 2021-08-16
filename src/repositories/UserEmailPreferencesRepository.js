const { UserEmailPreferencesModel } = require("../models");
const BaseRepository = require("./BaseRepository");

class UserEmailPreferencesRepository extends BaseRepository {
    constructor(props) {
        super(props)
    }

    getModel() {
        return UserEmailPreferencesModel
    }

    async findPreferencesByUserId(userId) {
        const result = await this.model
            .query()
            .where("user_email_preferences.user_id", userId)
            .first();

        if (!result) {
            return null;
        }

        return this.parserResult(result);
    }

}

module.exports = new UserEmailPreferencesRepository()
