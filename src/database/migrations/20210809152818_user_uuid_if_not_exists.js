const {USERS_TABLE} = require("../../constants/DBTables");

exports.up = (knex) => {
    return knex.schema.hasColumn(USERS_TABLE, 'uuid').then((exists) => {
        if(!exists) {
            return knex.schema.alterTable(USERS_TABLE, (table) => {
                table.biginteger("uuid").index();
            });
        }
    });
}

exports.down = function(knex) {
    return;
};
