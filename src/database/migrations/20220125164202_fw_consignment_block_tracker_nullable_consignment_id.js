const { FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE } = require("../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE, table => {
  table.integer("consignment_id")
    .index()
    .unsigned()
    .references("collectables.consignment_id")
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
});

exports.down = knex => knex.schema.alterTable(FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE, table => {
  
});