const {ARTISTS_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(ARTISTS_TABLE, table => {
    table.increments();
    table.string("name").index();
    table.string("url").nullable();
    table.string("avatar");
    table.string("video").nullable();
    table.text("quote").nullable();
    table.text("bio").nullable();
    table.text("review").nullable();
    table.json("socials").nullable();
    table.timestamps(true, true);
});


exports.down = knex => knex.schema.dropTable(ARTISTS_TABLE);

