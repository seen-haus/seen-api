const { SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE } = require("../../constants/DBTables");

exports.up = (knex) => knex.schema.alterTable(SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE, table => {
  table.string("profile_image");
});

exports.down = knex => knex.schema.alterTable(SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE, (table) => {
  table.dropColumn("profile_image");
});