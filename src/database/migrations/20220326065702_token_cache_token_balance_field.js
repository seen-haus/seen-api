const { TOKEN_CACHE_TABLE } = require("../../constants/DBTables");

exports.up = async (knex) => {
  await knex.schema.alterTable(TOKEN_CACHE_TABLE, (table) => {
    table.integer("token_balance").default(0)
  });
  await knex.schema.client.raw(`UPDATE \`${TOKEN_CACHE_TABLE}\` SET \`token_balance\`=1 WHERE \`token_address\`='0x0427743DF720801825a5c82e0582B1E915E0F750'`)
}

exports.down = (knex) =>
  knex.schema.alterTable(TOKEN_CACHE_TABLE, (table) => {
    table.dropColumn("token_balance")
  });