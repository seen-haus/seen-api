const { SNAPSHOT_DECLARATIONS_TABLE, TOKEN_HOLDER_BLOCK_TRACKER_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(SNAPSHOT_DECLARATIONS_TABLE, table => {
  table.increments();
  table.string("token_address")
    .references(`${TOKEN_HOLDER_BLOCK_TRACKER_TABLE}.token_address`)
    .unique()
    .notNullable()
    .index();
  table.integer("snapshot_interval").unsigned().notNullable();
  table.integer("first_snapshot_target_unix").unsigned().notNullable();
  table.integer("last_snapshot_target_unix").unsigned().notNullable();
  table.integer("first_snapshot_block").unsigned().notNullable();
  table.integer("last_snapshot_block").unsigned().notNullable();
  table.integer("first_snapshot_actual_unix").unsigned().notNullable();
  table.integer("last_snapshot_actual_unix").unsigned().notNullable();
  table.boolean("enabled");
  table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(SNAPSHOT_DECLARATIONS_TABLE);