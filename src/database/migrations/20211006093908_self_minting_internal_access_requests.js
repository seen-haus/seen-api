const { SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE } = require("../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE, table => {
  table.increments();
  table.string("name").index();
  table.string("wallet_address").unique()
    .index()
    .notNullable();
  table.string("email").index();
  table.json("socials").notNullable();
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(SELF_MINTING_INTERNAL_ACCESS_REQUESTS_TABLE);