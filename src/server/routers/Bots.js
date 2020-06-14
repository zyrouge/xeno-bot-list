const { Router } = require("express");
const { checkStaff, checkAuth } = require("../");
const _ = require("lodash");

module.exports = (client) => {
    const router = Router();

    const AddRouter = require("./AddBot")(client);
    router.use("/add", AddRouter);

    router.get("/:botID/vote", checkAuth, async (req, res) => {
        const botID = `${req.params.botID}`;
        const botDB = await client.database.Bots.findOne({ where: { botID } });
        if(!botDB) return res.redirect("/404");
        const bot = await client.users.fetch(botID).catch(() => {}) || null;
        if(!bot) {
            await client.queue.autoDelete(client, botID, "Bot doesn't exist");
            return res.redirect("/404");
        }
        const dailyUpvotes = await client.database.Upvotes.get(`${botID}_upvotes_${new Date().toISOString().slice(0, 10)}`) || 0;
        res.render("BotVote.ejs", { bot: req.bot, botDB, botInfo: bot, user: (req.user || null), dailyUpvotes });
    });

    router.post("/:botID/vote", checkAuth, async (req, res) => {
        const botID = `${req.params.botID}`;
        const botDB = await client.database.Bots.findOne({ where: { botID } });
        if(!botDB || !botDB.dataValues) return res.json({ ok: false, message: "NO_SUCH_BOT", reason: "No Such Bot was found!" });
        const OneHour = 60 * 60 * 1000;
        const TwentyFourHour = 24 * OneHour;
        const ISO = new Date().toISOString().slice(0, 10);
        const BotUserKey = `${botID}_${req.user.id}_upvotes_${ISO}`;
        const BotKey = `${botID}_upvotes_${ISO}`;
        const lastUpvote = await client.database.Upvotes.get(BotUserKey) || null;
        if(lastUpvote) {
            const timeDiff = Date.now() - lastUpvote;
            const remaining = TwentyFourHour - timeDiff;
            if(timeDiff < TwentyFourHour) return res.json({ ok: false, message: "REMAINING", remaining });
        }
        await client.database.Upvotes.set(BotUserKey, Date.now());
        const dailyBefore = await client.database.Upvotes.get(BotKey) || 0;
        await client.database.Upvotes.set(BotKey, dailyBefore + 1);
        await client.database.Bots.update({
            totalUpvotes: (parseInt(botDB.dataValues.totalUpvotes) || 0) + 1
        }, { where: { botID } });
        return res.json({ ok: true });
    });

    router.get("/:botID/edit", checkAuth, async (req, res) => {
        const botID = `${req.params.botID}`;
        const botDB = await client.database.Bots.findOne({ where: { botID } });
        if(!botDB || !botDB.dataValues) return res.redirect("/404");
        if(req.user.id !== botDB.dataValues.ownerID) return res.redirect("/404");
        const bot = await client.users.fetch(botID).catch(() => {}) || null;
        if(!bot) {
            await client.queue.autoDelete(client, botID, "Bot doesn't exist");
            return res.redirect("/404");
        }
        res.render("EditBot.ejs", { bot: req.bot, botDB, botInfo: bot, user: (req.user || null) });
    });

    router.post("/:botID/edit", checkAuth, async (req, res) => {
        const botID = `${req.params.botID}`;
        const botDB = await client.database.Bots.findOne({ where: { botID } });
        if(!botDB || !botDB.dataValues) return res.redirect("/404");
        if(req.user.id !== botDB.dataValues.ownerID) return res.redirect("/404");
        client.queue.handleEdit(client, botID, req.body, req.user)
        .then(() => {
            return res.status(201).json({ message: "Edited the bot", code: "OK" });
        })
        .catch((e) => {
            if(e === "INVALID_BOT") res.status(400).json({ message: "Bot ID doesn't exist", code: e });
            else if(e === "INTERNAL_DB_ERROR") res.status(400).json({ message: "Couldn't save changes", code: e });
            else res.status(500).json({ message: "INTERNAL_SERVER_ERROR", code: e });
        });
    });

    router.get("/:botID/delete", checkAuth, async (req, res) => {
        const botID = `${req.params.botID}`;
        const botDB = await client.database.Bots.findOne({ where: { botID } });
        if(!botDB || !botDB.dataValues) return res.redirect("/404");
        if(req.user.id === botDB.dataValues.ownerID || req.user.staff) {
            const bot = await client.users.fetch(botID).catch(() => {}) || null;
            if(!bot) {
                await client.queue.autoDelete(client, botID, "Bot doesn't exist");
                return res.redirect("/404");
            }
            res.render("DeleteBot.ejs", { bot: req.bot, botDB, botInfo: bot, user: (req.user || null) });
        } else return res.redirect("/404");
    });

    router.post("/:botID/delete", checkAuth, async (req, res) => {
        const botID = `${req.params.botID}`;
        const botDB = await client.database.Bots.findOne({ where: { botID } });
        if(!botDB || !botDB.dataValues) return res.redirect("/404");
        if(req.user.id === botDB.dataValues.ownerID || req.user.staff) {
            client.queue.handleDelete(client, botID, req.user)
            .then(() => {
                res.status(201).json({ message: "Deleted the bot", code: "OK" });
                if(!botDB.dataValues.isApproved && client.queueIO) client.queueIO.emit("queueServerRequest");
            })
            .catch((e) => {
                res.status(500).json({ message: "INTERNAL_SERVER_ERROR", code: e });
            });
        } else return res.redirect("/404");
        
    });

    router.get("/:botID", async (req, res) => {
        const botID = `${req.params.botID}`;
        const botDB = await client.database.Bots.findOne({ where: { botID } });
        if(!botDB || !botDB.dataValues) return res.redirect("/404");
        let guild, bot, owner, botMember;
        if(botDB.dataValues.isApproved) {
            guild = client.guilds.cache.get(client.config.guilds.main);
            botMember = await guild.members.fetch(botID).catch(() => {}) || null;
            owner = await guild.members.fetch(botDB.ownerID).catch(() => {}) || null;
            if(!botMember || !owner) {
                await client.queue.autoDelete(client, botID, !botMember ? "Bot not in guild" : "Owner not in guild");
                return res.redirect("/404");
            }
        } else {
            if(!req.user) return res.redirect("/404");
            if(botDB.dataValues.ownerID === req.user.id || req.user.staff) {
                bot = await client.users.fetch(botID).catch(() => {}) || null;
                owner = await client.users.fetch(botDB.ownerID).catch(() => {}) || null;
            } else return res.redirect("/404");
        }
        botDB.dataValues.botTags = botDB.dataValues.botTags.map(x => `${_.startCase(_.toLower(x))}`);
        const dailyUpvotes = await client.database.Upvotes.get(`${botID}_upvotes_${new Date().toISOString().slice(0, 10)}`) || 0;
        res.render("ViewBot.ejs", { bot: req.bot, botDB, botInfo: botMember ? botMember.user : bot, botMember, user: (req.user || null), botOwner: owner.user ? owner.user : owner, dailyUpvotes });
    });

    router.get("/", async (req, res) => {
        const result = await req.bot.database.Bots.findAll({ limit : 12 }) || [];
        const Bots = [];
        result.map(bot => bot.dataValues).forEach(bot => {
            const Bot = req.bot.users.cache.get(bot.botID);
            if(Bot) {
                bot.tag = `${Bot.username}#${Bot.discriminator}`;
                bot.avatar = Bot.avatar;
                bot.upvotes = req.bot.database.Upvotes.get(`${bot.botID}_upvotes_${new Date().toISOString().slice(0, 10)}`) || 0;
                Bots.push(bot);
            }
        });
        res.render("Bots.ejs", { bot: req.bot, bots: _.chunk(Bots, 4), user: (req.user || null), search: null });
    });

    return router;
}