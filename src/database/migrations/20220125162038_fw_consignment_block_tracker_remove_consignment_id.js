const { FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE } = require("../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE, table => {
  table.dropForeign('consignment_id')
  table.dropColumn('consignment_id')
});

exports.down = knex => knex.schema.alterTable(FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE, table => {
  
});