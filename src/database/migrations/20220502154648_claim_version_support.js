const {CLAIMS_TABLE} = require("../../constants/DBTables");

exports.up = async (knex) =>
  knex.schema.alterTable(CLAIMS_TABLE, async (table) => {
    table.integer("version").nullable();
    await knex.schema.client.raw(`UPDATE \`${CLAIMS_TABLE}\` SET \`version\`=2`)
  });

exports.down = (knex) =>
  knex.schema.alterTable(CLAIMS_TABLE, (table) => {
    table.dropColumn("version")
  });