const {USERS_TABLE} = require("./../../constants/DBTables");


exports.up = (knex) => knex.schema.createTable(USERS_TABLE, table => {
    table.increments();
    table.string("wallet_address").unique()
        .index()
        .notNullable();
    table.string("username").unique().nullable();
    table.string("image").nullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(USERS_TABLE);
