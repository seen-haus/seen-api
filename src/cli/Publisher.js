const filler = require("./../services/filler.service");
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const Knex = require("knex");
const {dbConfig} = require("../config");
const {Model} = require("objection");
const {SALE, AUCTION} = require("../constants/PurchaseTypes")
const {SEEN_EXCLUSIVE, REGULAR, MERCH} = require("../constants/Categories")
const {V2, V1} = require("../constants/Versions")
const {NFT, TANGIBLE_NFT, TANGIBLE} = require("../constants/Collectables")
// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

/**
 * Arguments
 */
const type = argv.type;

const publishNFT =
    async (artist, token) => {
        const data = {
            title: "Test",
            slug: "test-test",
            type_description: "Frammed artwork",
            type: NFT,
            purchase_type: SALE,
            category: REGULAR,
            description: "<p></p>",
            available_qty: 0,
            edition: 1,
            edition_of: 1,
            contract_address: "contract_address",
            is_active: 1,
            is_sold_out: 0,
            starts_at: collectable.starts_at,
            ends_at: collectable.ends_at,
            start_bid: 0.3,
            min_bid: 0.3,
            price: null,
            media: [
                {
                    type: "image",
                    url: "",
                    alt: ""
                },
                {
                    type: "video",
                    url: "",
                    alt: ""
                },
            ],
            artist_statement: "<p></p>",
            version: V1
        }

        await filler.createCollectible(data, artist, token)
    }

const publishAuction =
    async (artist, token) => {

        const data = {
            title: "Test",
            slug: "test-test",
            type_description: "Frammed artwork",
            type: TANGIBLE_NFT,
            purchase_type: AUCTION,
            category: REGULAR,
            description: "<p></p>",
            available_qty: 0,
            edition: 1,
            edition_of: 1,
            contract_address: "contract_address",
            is_active: 1,
            is_sold_out: 0,
            starts_at: collectable.starts_at,
            ends_at: collectable.ends_at,
            start_bid: 0.3,
            min_bid: 0.3,
            price: null,
            media: [
                {
                    type: "image",
                    url: "",
                    alt: ""
                },
                {
                    type: "video",
                    url: "",
                    alt: ""
                },
            ],
            artist_statement: "<p></p>",
            version: V1
        }
        await filler.createCollectible(data, artist, token);
    }


const publish = async (type) => {

    if (type === 'nft') {
        let artist = {
            name: "Name",
            url: "https://www.google.com",
            avatar: "https://www.google.com",
            video: "",
            quote: "",
            bio: "",
            review: "",
            socials: [{url: 'https://twitter.com/buddyart00', title: 'twitter'}],
        }
        let token = {
            contract_address: "",
            creator_address: "",
            supply: "",
            token_id: "",
            tx: "",
            metadata: {
                lot: 15,
                chapter: 1,
                edition: "1/1",
                dateCreated: "2021",
                authenticitySerial: "SEEN-xxxx (disclosed to buyer)",
            },
        }
        await publishNFT(artist, token)
    }

    if (type === 'auction') {
        let artist = {
            name: "Name",
            url: "https://www.google.com",
            avatar: "https://www.google.com",
            video: "",
            quote: "",
            bio: "",
            review: "",
            socials: [{url: 'https://twitter.com/buddyart00', title: 'twitter'}],
        }
        let token = {
            contract_address: "",
            creator_address: "",
            supply: "",
            token_id: "",
            tx: "",
            metadata: {
                lot: 15,
                chapter: 1,
                edition: "1/1",
                dateCreated: "2021",
                authenticitySerial: "SEEN-xxxx (disclosed to buyer)",
            },
        }
        await publishAuction(artist, token)
    }
}

publish(type)
