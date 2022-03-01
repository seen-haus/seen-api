const { TAG_TO_COLLECTABLE_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class TagToCollectableModel extends BaseModel {
    static get tableName() {
      return TAG_TO_COLLECTABLE_TABLE
    }

    static get idColumn() {
      return "id"
    }
}
