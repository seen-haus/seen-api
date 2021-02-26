const {COLLECTIBLE_WINNER_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(COLLECTIBLE_WINNER_TABLE, table => {
    table.increments();
    table.string("wallet_address").index();
    table.integer("collectable_id")
        .unsigned()
        .references("collectables.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    table.string("first_name");
    table.string("last_name");
    table.string("email").index();
    table.string("collectable_type").nullable();
    table.string("address");
    table.string("city");
    table.string("zip");
    table.string("province").nullable();
    table.string("country");
    table.string("phone").nullable();
    table.string("telegram_username").nullable();
    table.timestamps(true, true);
});


exports.down = knex => knex.schema.dropTable(COLLECTIBLE_WINNER_TABLE);
