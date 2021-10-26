const { FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE, table => {
  table.increments();
  table.integer("consignment_id") // If you are running this locally, use integer instead of biginterger
    .index()
    .unique()
    .notNullable()
    .unsigned()
    .references("collectables.consignment_id")
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
  table.integer("latest_checked_block_number")
    .nullable();
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(FALLBACK_WORKER_CONSIGNMENT_EVENT_BLOCK_TRACKER_TABLE);