const { CONSIGNMENT_ID_TO_TICKET_METADATA_TABLE } = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(CONSIGNMENT_ID_TO_TICKET_METADATA_TABLE, table => {
    table.increments();
    table.integer("consignment_id")
        .references("collectables.consignment_id")
        .unique()
        .unsigned()
        .notNullable()
        .index();
    table.string("ticket_image_override").index().nullable();
    table.json("metadata").nullable();
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(CONSIGNMENT_ID_TO_TICKET_METADATA_TABLE);