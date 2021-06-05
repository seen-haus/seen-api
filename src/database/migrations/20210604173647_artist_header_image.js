const { ARTISTS_TABLE } = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(ARTISTS_TABLE, (table) => {
    table.string("header_image").nullable()
  });

exports.down = (knex) =>
  knex.schema.alterTable(ARTISTS_TABLE, (table) => {
    table.dropColumn("header_image");
  });