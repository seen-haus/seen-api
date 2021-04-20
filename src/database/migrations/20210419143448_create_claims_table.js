const {CLAIMS_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(CLAIMS_TABLE, table => {
    table.increments();
    table.integer("collectable_id")
        .unsigned()
        .references("collectables.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    table.string("contract_address")
        .nullable()
        .index();
    table.boolean("is_active").default(false);
    table.timestamps(true, true);

    table.unique(['collectable_id', 'contract_address']);
});


exports.down = knex => knex.schema.dropTable(CLAIMS_TABLE);
