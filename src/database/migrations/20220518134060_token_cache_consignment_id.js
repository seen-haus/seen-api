const {TOKEN_CACHE_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(TOKEN_CACHE_TABLE, (table) => {
    table.integer("consignment_id")
        .references("collectables.consignment_id")
        .unsigned()
        .nullable()
        .index();
  });

exports.down = (knex) =>
  knex.schema.alterTable(TOKEN_CACHE_TABLE, (table) => {
    table.dropColumn("consignment_id")
  });
