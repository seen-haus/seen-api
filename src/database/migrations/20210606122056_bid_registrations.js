const {BID_REGISTRATIONS_TABLE} = require("../../constants/DBTables");

exports.up = knex => knex.schema.createTable(BID_REGISTRATIONS_TABLE, table => {
    table.increments();
    table.integer("collectable_id")
        .unsigned()
        .references("collectables.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    table.string("bidder_address")
        .index();
    table.string("first_name")
    table.string("last_name")
    table.string("email")
    table.string("signed_message")
    table.string("plaintext_message")
    table.timestamps(true, true);
});


exports.down = knex => knex.schema.dropTable(BID_REGISTRATIONS_TABLE);
