const {USERS_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(USERS_TABLE, table => {
    table.string("password").nullable();
});


exports.down = knex => knex.schema.alterTable(USERS_TABLE, table => {
    table.dropColumn("password");
});
