const path = require("path");
const session = require("express-session");
const { static } = require("express");

module.exports = (client) => new Promise((resolve) => {
    
    const server = client.server,
    app = client.express;

    app.use(require("helmet")());
    app.disable('x-powered-by');

    app.use(require("body-parser").json());
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, "pages"));
    app.use('/static', static(path.join(__dirname, "css")));

    const MemoryStore = require('memorystore')(session);
    app.use(session({
        store: new MemoryStore({
            checkPeriod: 86400000
        }),
        secret: 'AuroraDiscordBot',
        resave: false,
        saveUninitialized: false
    }));

    app.use((req, res, next) => { req.bot = client; next(); });

    app.get("/ping", (req, res) => res.status(200).send({ ok: true }));
    app.get("/queue", async (req, res) => {
        const fetchedBots = await req.bot.database.Queue.findAll();
        const queue = fetchedBots ? fetchedBots.map(x => x.dataValues) : [];
        res.render("Queue.ejs", {
            bot: req.bot,
            queue
        });
    });

    server.listen(client.config.port);
    resolve();

});