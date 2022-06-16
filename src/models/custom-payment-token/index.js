const {CUSTOM_PAYMENT_TOKENS_TABLE} = require("./../../constants/DBTables")
const BaseModel = require("./../BaseModel");


module.exports = class CustomPaymentToken extends BaseModel {
    static get tableName() {
        return CUSTOM_PAYMENT_TOKENS_TABLE
    }

    static get idColumn() {
        return "id"
    }
}
