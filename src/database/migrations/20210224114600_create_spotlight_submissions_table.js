const {SPOTLIGHT_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(SPOTLIGHT_TABLE, table => {
    table.increments();
    table.string("name").nullable();
    table.string("phone").nullable();
    table.string("email").nullable().index();
    table.text("info").nullable();
    table.text("work").nullable();
    table.text("socials").nullable();

    table.timestamps(true, true);
});


exports.down = knex => knex.schema.dropTable(SPOTLIGHT_TABLE);
