const { Router } = require("express");
const { checkStaff } = require("../");
const { Op } = require("sequelize");

module.exports = (client) => {
    const router = Router();

    router.get("/", checkStaff, async (req, res) => {
        res.render("Queue.ejs", { bot: req.bot, user: (req.user || null) });
    });

    const queueIO = client.queueIO = client.io.of("/queue");

    queueIO.on("connection", (socket) => {
        socket.emit("queuePageLoaded");

        socket.on("queueRequest", async () => {
            const fetchedQueueBots = await client.database.Bots.findAll({ where: { isApproved: { [Op.not]: true } } }) || [];
            const queueBots = [];
            const queueBotsTesting = [];

            for (let i = 0; i < fetchedQueueBots.length; i++) {
                const queueBotInfo = fetchedQueueBots[i].dataValues;
                if(queueBotInfo) {
                    const queueBotRaw = await client.users.fetch(queueBotInfo.botID) || null;
                    if(queueBotRaw) {
                        queueBotInfo.tag = `${queueBotRaw.username}#${queueBotRaw.discriminator}`;
                        if(queueBotInfo.testedBy) queueBotsTesting.push(queueBotInfo);
                        else queueBots.push(queueBotInfo);
                    }
                }
            }

            socket.emit("queueData", queueBots, queueBotsTesting);
        });

        socket.on("startTesting", async (userID, botID) => {
            client.queue.handleTest(client, userID, botID)
            .then(() => {
                socket.emit("queueServerRequest");
            });
        });

        socket.on("botDecline", async (userID, botID, reason) => {
            client.queue.handleDeny(client, userID, botID, reason)
            .then(() => {
                socket.emit("queueServerRequest");
            });
        });
    });

    return router;
}