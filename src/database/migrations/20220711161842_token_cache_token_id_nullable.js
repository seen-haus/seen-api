const {TOKEN_CACHE_TABLE} = require("../../constants/DBTables");

exports.up = async (knex) =>
  knex.schema.alterTable(TOKEN_CACHE_TABLE, async (table) => {
    table.integer("token_id").nullable().alter();
  });

exports.down = (knex) =>
  knex.schema.alterTable(TOKEN_CACHE_TABLE, (table) => {
    table.integer("token_id").notNullable().alter();
  });