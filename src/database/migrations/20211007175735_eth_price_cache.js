const { ETH_PRICE_CACHE } = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(ETH_PRICE_CACHE, table => {
  table.increments();
  table.integer("usd_price")
    .nullable();
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(ETH_PRICE_CACHE);