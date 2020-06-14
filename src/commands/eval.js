const Discord = require("discord.js");

module.exports = {
    name: "eval",
    aliases: ["ev"],
    run: async (client, message, args) => {
        if(!["521007613475946496"].includes(message.author.id)) return;
        try {
            let evaled = eval(args.join(" "));
            message.channel.send(Discord.Util.escapeMarkdown(await clean(evaled)), { split: true, code: "js" });
        } catch (err) {
            message.channel.send(clean(err), { split: true, code:"xl" });
        }

        async function clean(text) {
            if (text && text.constructor.name == "Promise") text = await text;
            if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });
            text = text
              .replace(/`/g, "`" + String.fromCharCode(8203))
              .replace(/@/g, "@" + String.fromCharCode(8203))
              .replace(client.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");
            return text;
        }
    }
}