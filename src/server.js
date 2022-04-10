const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const Knex = require("knex");
const bodyParser = require("body-parser");
const { Model } = require("objection");
const { dbConfig } = require("./config");
const port = process.env.APP_PORT || 3005;
const app = express();
require("dotenv").config();
app.use(cors());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DB
const knex = Knex(dbConfig);
Model.knex(knex);


/**
 * Load Routes
 * @type {[type]}
 */
const routes = require("./routes");

routes(app);
app.listen(port);

console.log('App listening on port ' + port);
console.log("====== START =====");
