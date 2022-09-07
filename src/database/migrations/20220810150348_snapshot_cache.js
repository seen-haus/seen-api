const { SNAPSHOT_DECLARATIONS_TABLE, SNAPSHOT_CACHE_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(SNAPSHOT_CACHE_TABLE, table => {
    table.increments();
    table.string("token_address")
      .references(`${SNAPSHOT_DECLARATIONS_TABLE}.token_address`)
      .notNullable()
      .index();
    table.string("token_holder")
      .notNullable()
      .index();
    table.string("token_balance").default('0');
    table.string("token_balance_consumed").default('0');
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(SNAPSHOT_CACHE_TABLE);