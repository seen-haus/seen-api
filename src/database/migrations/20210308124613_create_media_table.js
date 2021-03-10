const {MEDIA_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(MEDIA_TABLE, table => {
    table.increments();
    table.string("url");
    table.string("origin_url").nullable();
    table.string("type"); // image, video
    table.string("path").nullable();
    table.integer("position").nullable();
    table.integer("collectable_id")
        .unsigned()
        .references("collectables.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
        .nullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(MEDIA_TABLE);
