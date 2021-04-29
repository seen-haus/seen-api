const { CLAIMS_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(CLAIMS_TABLE, (table) => {
    table.string("title").nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable(CLAIMS_TABLE, (table) => {
    table.dropColumn("title");
  });
