const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const Knex = require("knex");
const {dbConfig} = require("../config");
const {Model} = require("objection");
// init DB
const knex = Knex(dbConfig)
Model.knex(knex)
const {UserRepository} = require("./../repositories");
const PasswordHelper = require("../utils/PasswordHelper")

/**
 * Arguments
 */
const id = argv.id;
const password = argv.password;

const setUser = async (id, password) => {
    const user = await UserRepository.find(id);
    password = PasswordHelper.getHashedPassword(password);
    if (user) {
        await UserRepository.update({password}, user.id)
    }
    // else {
    //     await UserRepository.create({
    //         wallet,
    //         password
    //     });
    // }
    process.exit();
};

if (id && password) {
    setUser(id, password);
}


