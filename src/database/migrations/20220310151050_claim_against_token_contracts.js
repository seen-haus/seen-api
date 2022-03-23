const {CLAIM_AGAINST_TOKEN_CONTRACTS_TABLE} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(CLAIM_AGAINST_TOKEN_CONTRACTS_TABLE, table => {
    table.increments();
    table.string("contract_address").index().notNullable();
    table.string("token_address").index().notNullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(CLAIM_AGAINST_TOKEN_CONTRACTS_TABLE);