const { CURATION_ROUND_DECLARATIONS_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(CURATION_ROUND_DECLARATIONS_TABLE, table => {
  table.increments();
  table.string("topic").index().notNullable();
  table.integer("start_unix").unsigned().notNullable();
  table.integer("end_unix").unsigned().notNullable();
  table.integer("total_yes").unsigned().default(0);
  table.integer("total_no").unsigned().default(0);
  table.boolean("enabled");
  table.json("archive");
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(CURATION_ROUND_DECLARATIONS_TABLE);