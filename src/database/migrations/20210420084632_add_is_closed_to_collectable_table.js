const {COLLECTIBLES_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(COLLECTIBLES_TABLE, table => {
    table.boolean("is_closed").defaultTo(0);
});


exports.down = knex => knex.schema.alterTable(COLLECTIBLES_TABLE, table => {
    table.dropColumn("is_closed");
});
