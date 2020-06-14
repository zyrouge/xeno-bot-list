const { Router } = require("express");
const { checkAuth } = require("../");

module.exports = (client) => {
    const router = Router();

    router.get("/success", checkAuth, (req, res) => {
        res.render("AddedBot.ejs", { bot: req.bot, user: (req.user || null) });
    });

    router.post("/submit", checkAuth, (req, res) => {
        client.queue.handleAdd(client, req.body, req.user)
        .then(() => {
            res.status(201).json({ message: "Added to queue", code: "OK" });
            client.queueIO.emit("queueServerRequest");
            return;
        })
        .catch((e) => {
            if(e === "INVALID_BOT") res.status(400).json({ message: "Invalid Bot ID", code: e });
            else if(e === "NOT_BOT") res.status(400).json({ message: "ID must be a Bot's ID", code: e });
            else if(e === "SQLITE_CONSTRAINT") res.status(409).json({ message: "Bot is already submitted", code: e });
            else if(e === "OWNER_NOT_IN_MAIN") res.status(409).json({ message: "You must join our Discord Server to submit a bot", code: e });
            else if(e === "BOT_ALREAY_IN_MAIN") res.status(409).json({ message: "Bot is already in the Guild", code: e });
            else res.status(500).json({ message: "INTERNAL_SERVER_ERROR", code: e });
        });
    });

    router.get("/", checkAuth, (req, res) => {
        res.render("AddBot.ejs", { bot: req.bot, user: (req.user || null) });
    });

    return router;
}