const {USERS_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");

module.exports = class User extends BaseModel {
    static get tableName() {
        return USERS_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
