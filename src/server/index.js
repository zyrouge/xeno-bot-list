const path = require("path");
const session = require("express-session");
const SQLiteStore = require('connect-sqlite3')(session);
const express = require("express");
const passport = require("passport");
const { Strategy } = require("passport-discord").Strategy;
const _ = require("lodash");
const axios = require("axios");

module.exports = (client) => new Promise((resolve) => {
    
    const server = client.server,
    app = client.express;

    app.use(require("helmet")());
    app.disable('x-powered-by');

    app.use(require("express").json());
    app.use(require("express").urlencoded({ extended: false }));
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, "pages"));
    app.use('/static', express.static(path.join(__dirname, "css")));
    app.use('/assets', express.static(path.join(__dirname, "assets")));

    /* Authentication */
    bindAuth(app, client);

    /* Queue */
    const QueueRouter = require("./routers/Queue")(client);
    app.use("/queue", QueueRouter);

    /* Bot */
    const BotRouter = require("./routers/Bots")(client);
    app.use("/bots", BotRouter);

    /* Bot */
    const MeRouter = require("./routers/Me")(client);
    app.use("/me", MeRouter);

    /* Search */
    app.use("/search", require("./routers/Search"));

    /* Other Routes */
    app.get("/ping", (req, res) => res.status(200).send({ ok: true }));
    app.get("/404", (req, res) => (res.render("404.ejs", { bot: req.bot, user: (req.user || null) })));
    app.get("/", async (req, res) => {
        const FetchedBots = await client.database.Bots.findAll({
            where: { isApproved: true },
            limit : 12
        }) || [];
        const Bots = [];
        FetchedBots.map(bot => bot.dataValues).forEach(bot => {
            const Bot = client.users.cache.get(bot.botID);
            if(Bot) {
                bot.tag = `${Bot.username}#${Bot.discriminator}`;
                bot.avatar = Bot.avatar;
                bot.upvotes = client.database.Upvotes.get(`${bot.botID}_upvotes_${new Date().toISOString().slice(0, 10)}`) || 0;
                Bots.push(bot);
            }
        });
        res.render("Index.ejs", { bot: req.bot, user: (req.user || null), bots: _.chunk(Bots, 4) });
    });

    server.listen(client.config.port);
    resolve();

});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

module.exports.checkAuth = checkAuth;

async function checkStaff(req, res, next) {
    if(!req.isAuthenticated()) return res.redirect("/login");
    if(req.user.staff) return next();
    res.redirect("/");
}

module.exports.checkStaff = checkStaff;

function bindAuth (app, client) {
    app.use(session({
        store: new SQLiteStore,
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
        scope: client.config.bot.scopes
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            profile.tokens = { accessToken };
            return done(null, profile);
        });
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/login', (req, res) => {
        res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${client.config.bot.id}&redirect_uri=${encodeURIComponent(client.config.bot.redirect)}&response_type=code&scope=${encodeURIComponent(client.config.bot.scopes.join(" "))}`);
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

    app.use(async (req, res, next) => {
        req.bot = client;
        const isStaff = req.user ? await req.bot.func.isStaff(req.user.id) : false;
        if (req.user) {
            if(isStaff) req.user.staff = true;
            else req.user.staff = false;
        }
        next();
    });
}
