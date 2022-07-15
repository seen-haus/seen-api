const {COLLECTIBLES_TABLE, CUSTOM_PAYMENT_TOKENS_TABLE} = require("../../constants/DBTables");

exports.up = async (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, async (table) => {
    table.integer("custom_payment_token_id").unsigned().references(`${CUSTOM_PAYMENT_TOKENS_TABLE}.id`).nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropForeign("custom_payment_token_id")
    table.dropColumn("custom_payment_token_id")
  });