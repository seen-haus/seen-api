const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
const Knex = require("knex");
const {dbConfig} = require("../config");
const {Model} = require("objection");
const filler = require("./../services/filler.service");
// init DB
const knex = Knex(dbConfig)
Model.knex(knex)
const {CollectableRepository} = require("./../repositories/index");
/**
 * Arguments
 */
const id = argv.id;

const fill = async (id) => {
    const collectable = await CollectableRepository.findById(id);
    if (!collectable) {
        process.exit()
        return
    }
    await filler.fillEvents(collectable);
    process.exit()
};
if (id) {
    fill(id)
}
