const {ELIGIBLE_CLAIMANTS_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(ELIGIBLE_CLAIMANTS_TABLE, table => {
    table.increments();
    table.integer("claim_id")
        .unsigned()
        .references("claims.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    table.string("wallet_address")
        .nullable()
        .index();
    table.timestamps(true, true);

    table.unique(['claim_id', 'wallet_address']);
});


exports.down = knex => knex.schema.dropTable(ELIGIBLE_CLAIMANTS_TABLE);
