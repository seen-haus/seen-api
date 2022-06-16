const { CUSTOM_PAYMENT_TOKENS_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(CUSTOM_PAYMENT_TOKENS_TABLE, table => {
    table.increments();
    table.string("token_address").unique().index().notNullable();
    table.string("token_name").index().notNullable();
    table.string("token_symbol").index().notNullable();
    table.integer("token_decimals").unsigned().notNullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(CUSTOM_PAYMENT_TOKENS_TABLE);