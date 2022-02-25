const {COLLECTIBLES_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.string("rights").nullable().index();
    table.json("attributes").nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropColumn("rights");
    table.dropColumn("attributes");
  });
