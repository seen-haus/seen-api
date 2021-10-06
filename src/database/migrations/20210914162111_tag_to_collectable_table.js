const {TAG_TO_COLLECTABLE_TABLE} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(TAG_TO_COLLECTABLE_TABLE, table => {
    table.increments();
    table.integer("collectable_id")
      .unsigned()
      .index()
      .references("collectables.id")
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
    table.integer("tag_id")
      .unsigned()
      .index()
      .references("tags.id")
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(TAG_TO_COLLECTABLE_TABLE);