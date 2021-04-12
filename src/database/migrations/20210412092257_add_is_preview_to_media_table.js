const {MEDIA_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(MEDIA_TABLE, table => {
    table.boolean("is_preview").defaultTo(0);
});


exports.down = knex => knex.schema.alterTable(MEDIA_TABLE, table => {
    table.dropColumn("is_preview");
});
