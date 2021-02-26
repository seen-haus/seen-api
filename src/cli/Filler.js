const filler = require("./../services/option-filler.service");
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const Knex = require("knex");
const {dbConfig} = require("../config");
const {Model} = require("objection");
// init DB
const knex = Knex(dbConfig)
Model.knex(knex)

/**
 * Arguments
 */
const all = argv.all;



const getTokens = async () => {
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query('SELECT * from tokens', function (error, results, fields) {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
        connection.end();
    });
};


