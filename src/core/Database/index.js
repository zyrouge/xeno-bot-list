/* Upvotes */
const Enmap = require("enmap");
const Upvotes = new Enmap({
    name: "upvotes",
    autoFetch: true,
    fetchAll: false
});

/* Sequelize */
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

if(!fs.existsSync(__dirname + "/../../storage")) fs.mkdirSync(__dirname + "/../../storage");

const sequelize = new Sequelize({
    host: 'localhost',
    dialect: 'sqlite',
    storage: path.resolve("src", "storage", "database.sqlite"),
    logging: false
});

const Bots = sequelize.import("Bots");

/* Export */
module.exports = { Bots, Upvotes };