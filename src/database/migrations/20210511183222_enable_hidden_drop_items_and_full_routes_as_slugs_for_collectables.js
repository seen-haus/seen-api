const {COLLECTIBLES_TABLE} = require("./../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.boolean("is_hidden_from_drop_list").default(false);
    table.boolean("is_slug_full_route").default(false);
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropColumn("is_hidden_from_drop_list");
    table.dropColumn("is_slug_full_route");
  });
