const {EVENTS_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.alterTable(EVENTS_TABLE, table => {
    table.string("tx").index().nullable();
    table.dropColumn("event_id");
});


exports.down = knex => knex.schema.alterTable(EVENTS_TABLE, table => {
    table.dropColumn("tx");
});
