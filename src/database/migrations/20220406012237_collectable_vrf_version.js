const {COLLECTIBLES_TABLE} = require("../../constants/DBTables");

exports.up = async (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, async (table) => {
    table.integer("vrf_version").nullable();
    await knex.schema.client.raw(`UPDATE \`${COLLECTIBLES_TABLE}\` SET \`vrf_version\`=1 WHERE \`is_vrf_drop\`=1`)
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropColumn("vrf_version")
  });