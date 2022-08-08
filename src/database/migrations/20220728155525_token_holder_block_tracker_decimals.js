const {TOKEN_HOLDER_BLOCK_TRACKER_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(TOKEN_HOLDER_BLOCK_TRACKER_TABLE, (table) => {
    table.integer("decimals").unsigned();
  });

exports.down = (knex) =>
  knex.schema.alterTable(TOKEN_HOLDER_BLOCK_TRACKER_TABLE, (table) => {
    table.dropColumn("decimals");
  });