const {COLLECTIBLES_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.boolean("is_vrf_drop").index().default(false)
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropColumn("is_vrf_drop")
  });