const {USERS_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(USERS_TABLE, table => {
    table.json("socials").nullable();
    table.text("description").nullable();
});


exports.down = knex => knex.schema.alterTable(USERS_TABLE, table => {
    table.dropColumn("socials");
    table.text("description").nullable();
});
