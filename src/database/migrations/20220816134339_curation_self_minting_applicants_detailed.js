const { 
  CURATION_SELF_MINTING_APPLICANTS_VOTES_TABLE,
  SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE
} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(CURATION_SELF_MINTING_APPLICANTS_VOTES_TABLE, table => {
  table.increments();
  table.integer("sm_applicant_id")
    .unsigned()
    .references(`${SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE}.id`)
    .notNullable()
    .index();
  table.string("voter_address")
    .notNullable()
    .index();
  table.integer("yes").unsigned().default(0);
  table.integer("no").unsigned().default(0);
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(CURATION_SELF_MINTING_APPLICANTS_VOTES_TABLE);