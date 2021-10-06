const {TAGS_TABLE} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(TAGS_TABLE, table => {
    table.increments();
    table.string("name")
      .index()
      .unique()
      .notNullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(TAGS_TABLE);