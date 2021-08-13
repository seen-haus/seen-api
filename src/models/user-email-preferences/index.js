const {USER_EMAIL_PREFERENCES_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");

module.exports = class UserEmailPreferences extends BaseModel {
    static get tableName() {
        return USER_EMAIL_PREFERENCES_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
