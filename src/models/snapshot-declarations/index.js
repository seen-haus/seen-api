const { SNAPSHOT_DECLARATIONS_TABLE, TOKEN_HOLDER_BLOCK_TRACKER_TABLE } = require("../../constants/DBTables")
const BaseModel = require("../BaseModel");

module.exports = class SnapshotDeclarationsModel extends BaseModel {
    static get tableName() {
        return SNAPSHOT_DECLARATIONS_TABLE
    }

    static get idColumn() {
        return "id"
    }

    static get relationMappings() {
      const TokenHolderBlockTracker = require("../token-holder-block-tracker");
      return {
          token_data: {
              relation: BaseModel.HasOneRelation,
              modelClass: TokenHolderBlockTracker,
              join: {
                  from: `${SNAPSHOT_DECLARATIONS_TABLE}.token_address`,
                  to: `${TOKEN_HOLDER_BLOCK_TRACKER_TABLE}.token_address`,
              }
          },
      }
    }
}
