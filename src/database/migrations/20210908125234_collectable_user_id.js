const {COLLECTIBLES_TABLE} = require("../../constants/DBTables");

exports.up = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table[process.env.NODE_ENV === 'local' ? 'integer' : 'biginteger']("user_id") // If you are running this locally, use integer instead of biginterger
        .unsigned()
        .references("users.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropColumn("user_id")
  });
