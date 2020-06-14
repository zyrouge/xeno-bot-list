const { Router } = require("express");
const { checkStaff, checkAuth } = require("../");
const _ = require("lodash");

module.exports = (client) => {
    const router = Router();

    router.use(checkAuth);

    router.get("/", async (req, res) => {
        const FetchedBots = await client.database.Bots.findAll({ where: { ownerID: req.user.id } }) || [];
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
        res.render("Me.ejs", { bot: req.bot, user: req.user, bots: _.chunk(Bots, 4) });
    });

    return router;
}