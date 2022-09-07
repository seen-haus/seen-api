const { 
  CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE,
  CURATION_ROUND_DECLARATIONS_TABLE
} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.alterTable(CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE, table => {
  table.integer("total_effective").default(0);
});

exports.down = (knex) =>
  knex.schema.alterTable(CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE, (table) => {
    table.dropColumn("total_effective")
  });