const {SECONDARY_MARKET_LISTINGS} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(SECONDARY_MARKET_LISTINGS, table => {
    table.increments();
    table.integer("collectable_id")
      .unsigned()
      .index()
      .references("collectables.id")
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
    table.string("winner_address").nullable().index();
    table.string("slug").index();
    table.integer("purchase_type").index();
    table.integer("available_qty").nullable();
    table.integer("edition");
    table.integer("edition_of");
    table.string("contract_address")
      .nullable()
      .index();
    table.boolean("is_closed").default(false).index();
    table.boolean("is_active").default(true);
    table.boolean("is_sold_out").default(false);
    table.timestamp("starts_at").nullable();
    table.timestamp("ends_at").nullable();
    table.decimal("start_bid", 28, 18).nullable();
    table.decimal("min_bid", 28, 18).nullable();
    table.decimal("price", 28, 18).nullable();
    table.integer("version").nullable();
    table.boolean("is_reserve_price_auction").default(false)
    table.integer("consignment_id")
      .unsigned()
      .unique()
      .index();
    table[process.env.NODE_ENV === 'local' ? 'integer' : 'biginteger']("user_id") // If you are running this locally, use integer instead of biginterger
      .unsigned()
      .references("users.id")
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
    table.integer("market_type")
      .unsigned()
      .index();
    table.integer("market_handler_type")
      .unsigned()
      .index();
    table.integer("clock_type")
      .unsigned();
    table.integer("state")
      .unsigned()
      .index();
    table.integer("outcome")
      .unsigned()
      .index();
    table.boolean("multi_token");
    table.boolean("released");
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(SECONDARY_MARKET_LISTINGS);