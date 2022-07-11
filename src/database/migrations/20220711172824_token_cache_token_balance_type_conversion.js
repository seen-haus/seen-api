const { TOKEN_CACHE_TABLE } = require("../../constants/DBTables");

exports.up = async (knex) => {
  await knex.schema.alterTable(TOKEN_CACHE_TABLE, (table) => {
    table.string("token_balance").default('0').alter();
  });
}

exports.down = (knex) =>
  knex.schema.alterTable(TOKEN_CACHE_TABLE, (table) => {
    table.integer("token_balance").default(0).alter();
  });