const {FEATURED_DROP_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(FEATURED_DROP_TABLE, table => {
    table.increments();
    table.integer("collectable_id")
        .unsigned()
        .references("collectables.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    table.timestamps(true, true);
    table.unique(['collectable_id']);
});


exports.down = knex => knex.schema.dropTable(CLAIMS_TABLE);
