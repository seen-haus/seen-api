const { SNAPSHOT_DECLARATIONS_TABLE, SNAPSHOT_TRACKER_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(SNAPSHOT_TRACKER_TABLE, table => {
    table.increments();
    table.string("token_address")
      .references(`${SNAPSHOT_DECLARATIONS_TABLE}.token_address`)
      .notNullable()
      .index();
    table.integer("snapshot_time_target").unsigned().notNullable();
    table.integer("snapshot_time_actual").unsigned().notNullable();
    table.integer("snapshot_block").unsigned().notNullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(SNAPSHOT_TRACKER_TABLE);