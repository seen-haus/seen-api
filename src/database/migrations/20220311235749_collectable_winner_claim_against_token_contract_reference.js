const { COLLECTIBLE_WINNER_TABLE } = require("../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(COLLECTIBLE_WINNER_TABLE, table => {
  table.integer("cat_contract_ref") // claim_against_token_contract_reference
    .index()
    .unsigned()
    .references("claim_against_token_contracts.id")
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
});

exports.down = knex => knex.schema.alterTable(COLLECTIBLE_WINNER_TABLE, table => {
  
});