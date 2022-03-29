const { EVENTS_TABLE } = require("../../constants/DBTables");

exports.up = async (knex) => {
  await knex.schema.alterTable(EVENTS_TABLE, (table) => {
    // Can be used in scenarios where multiple events can happen within the same transaction,
    // to check whether or not an event has already been indexed in such cases
    table.string("meta").index().nullable()
  });
}

exports.down = (knex) =>
  knex.schema.alterTable(EVENTS_TABLE, (table) => {
    table.dropColumn("meta")
  });