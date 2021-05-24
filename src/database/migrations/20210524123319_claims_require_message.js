const { CLAIMS_TABLE } = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(CLAIMS_TABLE, (table) => {
    table.boolean("requires_message")
        .default(false);
    table.text("message_helper").nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable(CLAIMS_TABLE, (table) => {
    table.dropColumn("requires_message");
    table.dropColumn("message_helper");
  });