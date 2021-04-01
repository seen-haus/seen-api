const {USERS_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(USERS_TABLE, table => {
    table.json("socials").nullable();
    table.text("description").nullable();
    table.dropColumn("contact");
    table.dropColumn("first_name");
    table.dropColumn("last_name");
    table.dropColumn("address");
    table.dropColumn("city");
    table.dropColumn("zip");
    table.dropColumn("province");
    table.dropColumn("country");
});


exports.down = knex => knex.schema.alterTable(USERS_TABLE, table => {
    table.dropColumn("socials");
    table.text("description").nullable();
});
