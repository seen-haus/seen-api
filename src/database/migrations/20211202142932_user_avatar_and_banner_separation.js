const {USERS_TABLE} = require("../../constants/DBTables");

exports.up = (knex) => {
  return knex.schema.alterTable(USERS_TABLE, (table) => {
    table.renameColumn('image', 'avatar_image');
    table.string("banner_image").nullable();
  });
}

exports.down = function(knex) {
  return knex.schema.alterTable(USERS_TABLE, (table) => {
    table.renameColumn('avatar_image', 'image');
    table.dropColumn('banner_image');
  });
};
