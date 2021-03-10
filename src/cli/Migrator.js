const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const Knex = require("knex");
const {dbConfig} = require("../config");
const filler = require("../services/filler.service");
const {Model} = require("objection");
const mysql = require('mysql');
const {NFT, TANGIBLE_NFT, TANGIBLE} = require("../constants/Collectables");
const {SALE, AUCTION} = require("../constants/PurchaseTypes");
// TEMP FILE (ONLY FOR MIGRATION)
// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

const connection = mysql.createConnection({
    connectionLimit: 20,
    host: dbConfig.connection.host,
    user: dbConfig.connection.user,
    password: dbConfig.connection.password,
    database: dbConfig.connection.database,
});
/**
 * Arguments
 */
const getTokens = async () => {
    return new Promise((resolve, reject) => {

        connection.query('SELECT * from tokens', function (error, results, fields) {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });

    });
};

const getProducts = async () => {
    return new Promise((resolve, reject) => {

        connection.query('SELECT * from products', function (error, results, fields) {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });

    });
};

const getNFTs = async () => {
    return new Promise((resolve, reject) => {

        connection.query('SELECT * from nft_collections', function (error, results, fields) {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });

    });
};

const getAuctions = () => {
    return new Promise((resolve, reject) => {

        connection.query('SELECT * from auctions', function (error, results, fields) {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });

    });
};

const getBids = async () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from bids', function (error, results, fields) {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}

const migrateNFTs = async (nfts, tokens) => {
    for (let i = 0; i < nfts.length; i++) {
        let nft = nfts[i];

        let token = tokens.find(t => t.uuid === nft.token_uuid)
        nft.nft_contract_address = token.contract_address
        nft.nft_ipfs_hash = null
        nft.nft_token_id = token.token_id
        delete token.creator;
        delete token.uuid;
        await (filler.migrateCollectible(NFT, SALE, nft, JSON.parse(nft.artist), nft.media))
    }
    return true;

}


const migrateProducts = async (products) => {
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        await (filler.migrateCollectible(TANGIBLE, SALE, product, JSON.parse(product.artist), product.media, null))
    }
    return true;
}


const migrateAuctions = async (auctions, tokens) => {
    for (let i = 0; i < auctions.length; i++) {
        let auction = auctions[i];
        let token = tokens.find(t => t.uuid === auction.token_uuid)
        token.creator_address = token.creator;
        auction.nft_contract_address = token.contract_address
        auction.nft_ipfs_hash = null
        auction.nft_token_id = token.token_id
        delete token.creator;
        delete token.uuid;
        await (filler.migrateCollectible(TANGIBLE_NFT, AUCTION, auction, JSON.parse(auction.artist), auction.media))

    }
    return true;
}
const migrate = async () => {
    // Connect
    connection.connect();
    let products = await getProducts();
    let nfts = await getNFTs();
    let auctions = await getAuctions();
    let tokens = await getTokens();
    // Disconnect
    connection.end();
    await migrateAuctions(auctions, tokens)
    await migrateNFTs(nfts, tokens)
    await migrateProducts(products)


    process.exit();
}


migrate();
