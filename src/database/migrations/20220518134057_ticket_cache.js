const {TICKET_CACHE_TABLE} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(TICKET_CACHE_TABLE, table => {
    table.increments();
    table.string("token_address").index().notNullable();
    table.integer("token_id").unsigned().index().notNullable();
    table.integer("consignment_id")
        .unsigned()
        .nullable()
        .index();
    table.string("burnt_by_address").nullable().index()
    table.json("metadata").nullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(TICKET_CACHE_TABLE);