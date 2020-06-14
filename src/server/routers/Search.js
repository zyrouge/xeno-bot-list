const { Op } = require("sequelize");
const _ = require("lodash");
const router = require("express").Router();

router.get("/", async (req, res) => {
    const search = req.query.q;
    if(!search) return res.redirect("/bots");
    const result = await req.bot.database.Bots.findAll({
        where: {
            isApproved: true,
            [Op.or]: [
                { shortDesc: { [Op.like]: `%${search}%` } },
                { longDesc: { [Op.like]: `%${search}%` } }
            ]
        },
        limit : 12
    }) || [];
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
    res.render("Bots.ejs", { bot: req.bot, bots: _.chunk(Bots, 4), user: (req.user || null), search });
});

module.exports = router;