const {SNAPSHOT_DECLARATIONS_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(SNAPSHOT_DECLARATIONS_TABLE, (table) => {
    table.boolean("is_busy_lock").index().default(false)
  });

exports.down = (knex) =>
  knex.schema.alterTable(SNAPSHOT_DECLARATIONS_TABLE, (table) => {
    table.dropColumn("is_busy_lock")
  });