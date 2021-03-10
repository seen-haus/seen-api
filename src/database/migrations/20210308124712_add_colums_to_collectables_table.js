const {COLLECTIBLES_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(COLLECTIBLES_TABLE, table => {
    table.boolean("is_coming_soon").default(false);
    table.string("shipping_location").nullable();
    table.dropColumn("media");
});

exports.down = knex => knex.schema.alterTable(COLLECTIBLES_TABLE, table => {
    table.dropColumn("is_coming_soon");
    table.dropColumn("shipping_location");
});
