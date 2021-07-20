const {COLLECTIBLES_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.boolean("is_open_edition").default(false)
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropColumn("is_open_edition")
  });
