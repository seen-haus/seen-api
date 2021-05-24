const { COLLECTIBLE_WINNER_TABLE } = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(COLLECTIBLE_WINNER_TABLE, (table) => {
    table.text("message").nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLE_WINNER_TABLE, (table) => {
    table.dropColumn("message");
  });