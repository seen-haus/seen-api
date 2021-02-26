const {EVENTS_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(EVENTS_TABLE, table => {
    table.increments();
    table.string("wallet_address").index();
    table.integer("collectable_id")
        .unsigned()
        .references("collectables.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    table.decimal("value", 28, 18).nullable();
    table.string("event_id");
    table.string("event_type").index();
    table.json("raw").nullable();
    table.timestamps(true, true);
});


exports.down = knex => knex.schema.dropTable(EVENTS_TABLE);
