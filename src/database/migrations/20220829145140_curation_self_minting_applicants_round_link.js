const { 
  CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE,
  CURATION_ROUND_DECLARATIONS_TABLE
} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.alterTable(CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE, table => {
  table.integer("round_declaration_id")
      .unsigned()
      .references(`${CURATION_ROUND_DECLARATIONS_TABLE}.id`)
      .notNullable()
      .index();
});

exports.down = (knex) =>
  knex.schema.alterTable(CURATION_SELF_MINTING_APPLICANTS_OVERVIEW_TABLE, (table) => {
    table.dropForeign("round_declaration_id")
    table.dropColumn("round_declaration_id")
  });