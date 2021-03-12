const {COLLECTIBLES_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(COLLECTIBLES_TABLE, table => {
    table.increments();
    table.string("title");
    table.string("slug").index();
    table.string("contract_address").index();
    table.string("medium").nullable();
    table.string("type").nullable();
    table.integer("purchase_type").index();
    table.string("category").index();
    table.integer("artist_id")
        .unsigned()
        .references("artists.id")
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    table.text("description").nullable();
    table.integer("available_qty").nullable();
    table.integer("edition");
    table.integer("edition_of");
    table.boolean("is_active").default(true);
    table.boolean("is_sold_out").default(false);
    table.timestamp("starts_at").nullable();
    table.timestamp("ends_at").nullable();
    table.decimal("start_bid", 28, 18).nullable();
    table.decimal("min_bid", 28, 18).nullable();
    table.decimal("price", 28, 18).nullable();
    table.json("media");
    table.text("artist_statement").nullable();
    table.string("winner_address").nullable().index();
    table.string("nft_contract_address").nullable();
    table.string("nft_ipfs_hash").nullable();
    table.string("nft_token_id").nullable();
    table.integer("version").nullable();
    table.timestamps(true, true);
});


exports.down = knex => knex.schema.dropTable(COLLECTIBLES_TABLE);
