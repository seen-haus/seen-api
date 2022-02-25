const {IPFS_MEDIA_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(IPFS_MEDIA_TABLE, table => {
    table.increments();
    table.string("uploader_address")
        .index();
    table.string("ipfs_hash");
    table.string("mime_type")
        .index();
    table.integer("file_size")
        .unsigned();
    table.timestamps(true, true);
});


exports.down = knex => knex.schema.dropTable(IPFS_MEDIA_TABLE);
