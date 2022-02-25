const { EVENTS_TABLE } = require("./../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(EVENTS_TABLE, table => {
  table.integer("secondary_market_listing_id")
    .unsigned()
    .references("secondary_market_listings.id")
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
});

exports.down = knex => knex.schema.alterTable(EVENTS_TABLE, table => {
  table.dropColumn("secondary_market_listing_id");
});
