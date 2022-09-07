const { CURATION_ROUND_DECLARATIONS_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class CurationRoundDeclarationsModel extends BaseModel {
    static get tableName() {
        return CURATION_ROUND_DECLARATIONS_TABLE
    }

    static get idColumn() {
        return "id"
    }

}
