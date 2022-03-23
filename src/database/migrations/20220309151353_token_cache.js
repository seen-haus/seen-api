const {TOKEN_CACHE_TABLE} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(TOKEN_CACHE_TABLE, table => {
    table.increments();
    table.string("token_address").index().notNullable();
    table.integer("token_id").unsigned().index().notNullable();
    table.string("token_holder").index();
    table.json("metadata").nullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(TOKEN_CACHE_TABLE);