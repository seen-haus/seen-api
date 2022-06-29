const {CLAIMS_TABLE} = require("../../constants/DBTables");

exports.up = async (knex) =>
  knex.schema.alterTable(CLAIMS_TABLE, async (table) => {
    table.timestamp("ends_at").nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable(CLAIMS_TABLE, (table) => {
    table.dropColumn("ends_at")
  });