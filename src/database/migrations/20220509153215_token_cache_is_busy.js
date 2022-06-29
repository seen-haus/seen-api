const {TOKEN_HOLDER_BLOCK_TRACKER_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(TOKEN_HOLDER_BLOCK_TRACKER_TABLE, (table) => {
    table.boolean("is_busy_lock").index().default(false)
  });

exports.down = (knex) =>
  knex.schema.alterTable(TOKEN_HOLDER_BLOCK_TRACKER_TABLE, (table) => {
    table.dropColumn("is_busy_lock")
  });