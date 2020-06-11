const path = require("path");
const session = require("express-session");
const { static } = require("express");
const passport = require("passport");
const { Strategy } = require("passport-discord").Strategy;

module.exports = (client) => new Promise((resolve) => {
    
    const server = client.server,
    app = client.express,
    io = client.io;

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
        secret: 'XenoBotList69',
        resave: false,
        saveUninitialized: false
    }));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    
    passport.use(new Strategy({
        clientID: client.config.bot.id,
        clientSecret: client.config.bot.secret,
        callbackURL: client.config.bot.redirect,
        scope: ['identify', 'email']
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            return done(null, profile);
        });
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/login', (req, res) => {
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${client.config.bot.id}&redirect_uri=${encodeURIComponent(client.config.bot.redirect)}&response_type=code&scope=identify%20email`);
    });

    app.get('/auth/callback',
        passport.authenticate('discord', {
            failureRedirect: '/'
        }), (req, res) => res.redirect('/')
    );

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.use((req, res, next) => { req.bot = client; next(); });

    app.get("/ping", (req, res) => res.status(200).send({ ok: true }));
    app.get("/queue", async (req, res) => {
        res.render("Queue.ejs", { bot: req.bot, user: req.user || null });
    });

    io.of("/queue").on("connection", (socket) => {
        socket.emit("queueLoaded");

        socket.on("queueRequest", async () => {
            const fetchedQueueBots = await client.database.Queue.findAll() || [];
            const queueBots = [];
            const queueBotsTesting = [];

            for (let i = 0; i < fetchedQueueBots.length; i++) {
                const queueBotInfo = fetchedQueueBots[i].dataValues;
                if(queueBotInfo) {
                    const queueBotRaw = await client.users.fetch(queueBotInfo.botID) || null;
                    if(queueBotRaw) {
                        queueBotInfo.tag = `${queueBotRaw.username}#${queueBotRaw.discriminator}`;
                        if(queueBotInfo.testing) queueBotsTesting.push(queueBotInfo);
                        else queueBots.push(queueBotInfo);
                    }
                }
            }

            socket.emit("queueData", queueBots, queueBotsTesting);
        });
    });

    server.listen(client.config.port);
    resolve();

});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}