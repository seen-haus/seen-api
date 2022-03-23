const {TOKEN_HOLDER_BLOCK_TRACKER_TABLE} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(TOKEN_HOLDER_BLOCK_TRACKER_TABLE, table => {
    table.increments();
    table.string("token_address").index().notNullable();
    table.integer("total_supply").unsigned();
    table.integer("first_id").unsigned();
    table.integer("latest_checked_block").unsigned();
    table.string("token_standard").index();
    table.boolean("enable_tracking").default(false).index();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(TOKEN_HOLDER_BLOCK_TRACKER_TABLE);