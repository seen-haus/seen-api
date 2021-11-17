const {USER_EMAIL_PREFERENCES_TABLE} = require("./../../constants/DBTables");

exports.up = (knex) => knex.schema.createTable(USER_EMAIL_PREFERENCES_TABLE, table => {
    table.increments();
    table[process.env.NODE_ENV === 'local' ? 'integer' : 'biginteger']("user_id") // If you are running this locally, use integer instead of biginterger
        .index()
        .notNullable()
        .unique()
        .unsigned()
        .references("users.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    table.boolean("global_disable").default(false);
    table.boolean("claim_page_go_live").default(true);
    table.boolean("outbid").default(true);
    table.timestamps(true, true);
});

exports.down = knex => knex.schema.dropTable(USER_EMAIL_PREFERENCES_TABLE);