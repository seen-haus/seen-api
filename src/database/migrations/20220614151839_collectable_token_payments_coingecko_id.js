const { CUSTOM_PAYMENT_TOKENS_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.alterTable(CUSTOM_PAYMENT_TOKENS_TABLE, table => {
    table.string("coingecko_id").unique().index().notNullable();
});

exports.down = (knex) =>
  knex.schema.alterTable(CUSTOM_PAYMENT_TOKENS_TABLE, (table) => {
    table.dropColumn("coingecko_id")
  });