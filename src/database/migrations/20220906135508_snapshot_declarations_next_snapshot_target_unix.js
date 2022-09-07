const {SNAPSHOT_DECLARATIONS_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(SNAPSHOT_DECLARATIONS_TABLE, (table) => {
    table.integer("next_snapshot_target_unix").unsigned().nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable(SNAPSHOT_DECLARATIONS_TABLE, (table) => {
    table.dropColumn("next_snapshot_target_unix")
  });