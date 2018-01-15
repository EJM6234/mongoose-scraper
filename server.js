const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const axios = require("axios");
const db = require("./models");

const app = express();
const mon = mongoose.connection;

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://heroku_c7wntxz7:df4gsgjl10vbuq4fpf6110pukt@ds251217.mlab.com:51217/heroku_c7wntxz7";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {useMongoClient: true});
mon.on('error', console.error.bind(console, 'connection error:'));
mon.once('open', function() {
  console.log("Mongoose DB connected!");
});

require("./controllers/controller.js")(app, db, cheerio, axios);

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
