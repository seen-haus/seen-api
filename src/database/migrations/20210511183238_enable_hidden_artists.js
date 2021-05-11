const { ARTISTS_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(ARTISTS_TABLE, (table) => {
    table.boolean("is_hidden_from_artist_list").default(false);
  });

exports.down = (knex) =>
  knex.schema.alterTable(ARTISTS_TABLE, (table) => {
    table.dropColumn("is_hidden_from_artist_list");
  });