const {COLLECTIBLES_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.string("bundle_parent_id").nullable().index()
    table.string("bundle_child_id").nullable().index()
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropColumn("bundle_parent_id")
    table.dropColumn("bundle_child_id")
  });
