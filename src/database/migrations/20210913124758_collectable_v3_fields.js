const {COLLECTIBLES_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.integer("market_type")
      .unsigned()
      .index();
    table.integer("market_handler_type")
      .unsigned()
      .index();
    table.integer("clock_type")
      .unsigned();
    table.integer("state")
      .unsigned()
      .index();
    table.integer("outcome")
      .unsigned()
      .index();
    table.boolean("multi_token");
    table.boolean("released");
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropColumn("market_handler_type");
    table.dropColumn("market_type");
    table.dropColumn("clock_type");
    table.dropColumn("state");
    table.dropColumn("outcome");
    table.dropColumn("multi_token");
    table.dropColumn("released");
  });
