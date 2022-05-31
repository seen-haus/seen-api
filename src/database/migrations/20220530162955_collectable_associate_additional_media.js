const {COLLECTIBLES_TABLE} = require("../../constants/DBTables");

exports.up = async (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, async (table) => {
    table.integer("additional_media_collectable_id").unsigned().references("collectables.id").nullable();
  });

exports.down = (knex) =>
  knex.schema.alterTable(COLLECTIBLES_TABLE, (table) => {
    table.dropColumn("additional_media_collectable_id")
  });