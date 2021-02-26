const {NFT_TOKENS_TABLE} = require("./../../constants/DBTables");

exports.up = knex => knex.schema.createTable(NFT_TOKENS_TABLE, table => {
    table.increments();
    table.string("contract_address").index();
    table.string("creator_address").index();
    table.string("tx").index();
    table.string("token_id").index();
    table.integer("supply");
    table.json("metadata").nullable();
    table.json("properties").nullable();
    table.json("royalties").nullable();
    table.timestamps(true, true);
});


exports.down = knex => knex.schema.dropTable(NFT_TOKENS_TABLE);
