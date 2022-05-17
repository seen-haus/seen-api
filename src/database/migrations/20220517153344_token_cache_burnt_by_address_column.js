const {TOKEN_CACHE_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(TOKEN_CACHE_TABLE, (table) => {
    table.string("burnt_by_address").nullable().index()
  });

exports.down = (knex) =>
  knex.schema.alterTable(TOKEN_CACHE_TABLE, (table) => {
    table.dropColumn("burnt_by_address")
  });