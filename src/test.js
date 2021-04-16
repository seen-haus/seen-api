const {dbConfig} = require("./config");
const mysql = require('mysql');
const Knex = require('knex');
const {Model} = require("objection")
const knex = Knex(dbConfig)
const {CollectableRepository} = require("./repositories/index")
const fillerService = require("./services/filler.service")
Model.knex(knex)
const init = async () => {
   let collectables = await CollectableRepository.all();
    for (let i = 0; i < collectables.length; i++) {
        let collectable = collectables[i];
        await fillerService.fillEvents(collectable);
    }
}
init();
