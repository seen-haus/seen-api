const {COLLECTIBLE_WINNER_TABLE} = require("./../../constants/DBTables");

exports.up = knex => 
  knex.schema.table(COLLECTIBLE_WINNER_TABLE, table => {
    table.unique(['collectable_id', 'wallet_address']);
  });

exports.down = knex =>
  knex.schema.table(COLLECTIBLE_WINNER_TABLE, table => {
    table.dropUnique(['collectable_id', 'wallet_address']);
  });
