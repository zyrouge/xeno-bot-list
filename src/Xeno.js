const { Client, Collection } = require("discord.js");
const fs = require("fs");

module.exports = class Xeno extends Client {
    constructor(...options) {
        super(...options);

        this.express = require("express")(); /* Express Server */
        this.server = require('http').Server(this.express); /* HTTP Server */
        this.io = require("socket.io")(this.server); /* Socket */
        this.queueIO = null; /* Queue Socket */
        this.commands = new Collection();
        this.aliases = new Collection();
        this.logger = new (require("./core/Logger"));
        this.queue = require("./core/Queue");
        this.config = require("yaml").parse(fs.readFileSync(__dirname + "/config.yaml", "utf8"));
        this.token = this.config.token;
        this.database = require("./core/Database");
        this.misc = require("./core/Misc");
        this.func = new (require("./core/Func"))(this);
    }

    load() {
        return new Promise((resolve) => {
            /* Events */
            fs.readdir(__dirname + "/events/", (error, files) => {
                if(error) this.logger.error(error);
                files.forEach(f => {
                    if(!f.endsWith(".js")) return;
                    const event = require(`./events/${f}`);
                    let file = f.split(".")[0];
                    this.on(file, event.bind(null, this));
                    delete require.cache[require.resolve(`./events/${file}`)];
                    this.logger.log(`Loaded ${f} (Event)`);
                });
            });

            /* Commands */
            fs.readdir(__dirname + "/commands/", (error, files) => {
                if(error) this.logger.error(error);
                files.forEach(f => {
                    if(!f.endsWith(".js")) return;
                    let props = require(`./commands/${f}`);
                    this.commands.set(props.name, props);
                    props.aliases.forEach(alias => this.aliases.set(alias, props.name));
                    this.logger.log(`Loaded ${f} (Command)`);
                });
            });

            /* Database */
            this.database.Bots.sync({ force: false }).then(() => this.logger.log(`Loaded Bots (Database)`));

            /* Server */
            require("./server")(this).then(() => this.logger.log(`Listening on PORT ${this.config.port} (Server)`));

            return resolve();
        });
    }

    connect() {
        return this.login(this.token);
    }
}