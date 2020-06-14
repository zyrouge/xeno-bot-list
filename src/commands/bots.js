const _ = require("lodash");

module.exports = {
    name: "bots",
    aliases: ["bot", "botinfo"],
    run: async (client, message, args) => {
        const user = client.users.cache.get(args[0]) || message.mentions.users.first() || message.author;
        if(!user) return message.channel.send("Provide a valid user");

        if(user.bot) {
            const botDB = await client.database.Bots.findOne({ where: { botID: user.id } });
            if(!botDB || !botDB.dataValues) return message.channel.send("Provide a valid user");
            const dailyUpvotes = await client.database.Upvotes.get(`${user.id}_upvotes_${new Date().toISOString().slice(0, 10)}`) || 0;
            return message.channel.send({
                embed: {
                    author: {
                        name: `${user.tag}'s Information`,
                        icon_url: user.avatarURL()
                    },
                    description: `${botDB.dataValues.shortDesc}`,
                    fields: [
                        {
                            name: `Prefix`,
                            value: `${botDB.dataValues.prefix}`
                        },
                        {
                            name: `Owner`,
                            value: `<@${botDB.dataValues.ownerID}>`
                        },
                        {
                            name: `Links`,
                            value: [
                                `${botDB.dataValues.botWebsite ? `**Website:** [Click here](${botDB.dataValues.botWebsite})`: ""}`,
                                `${botDB.dataValues.botServer ? `**Support Server:** [Click here](https://discord.gg/${botDB.dataValues.botServer})`: ""}`,
                                `**Invite:** [Click here](${botDB.dataValues.customInvite || `https://discordapp.com/oauth2/authorize?client_id=${user.id}&scope=bot&permissions=0`})`
                            ].filter(x => x).join("\n")
                        },
                        {
                            name: `Tags`,
                            value: `${botDB.dataValues.botTags.map(x => `${_.startCase(_.toLower(x))}`).join(", ")}`
                        },
                        {
                            name: `Upvotes`,
                            value: `**Today's Upvotes:** ${dailyUpvotes}\n**Total Upvotes:** ${botDB.dataValues.totalUpvotes}`
                        },
                        {
                            name: `Guilds`,
                            value: `${botDB.dataValues.guildsCount} Servers`
                        },
                        {
                            name: `Others`,
                            value: [
                                `**Submitted on:** ${new Date(parseInt(botDB.dataValues.submittedOn)).toLocaleString()}`,
                                `**Approved on:** ${new Date(parseInt(botDB.dataValues.approvedOn)).toLocaleString()}`,
                                `**Tested by:** <@${botDB.dataValues.testedBy}>`
                            ].join("\n")
                        },
                    ],
                    color: client.config.color,
                    timestamp: new Date(),
                    footer: {
                        text: client.user.username + " Bot List"
                    }
                }
            });
        } else {
            const botDB = await client.database.Bots.findAll({ where: { ownerID: user.id } });
            if(!user || !botDB.length) return message.channel.send(`**${user.tag}** doesnt have any bots.`);
            return message.channel.send({
                embed: {
                    author: {
                        name: `${user.tag}'s Bots`,
                        icon_url: user.avatarURL()
                    },
                    description: `${botDB.map(bot => `<@${bot.dataValues.botID}>`).join("\n")}`,
                    color: client.config.color,
                    timestamp: new Date(),
                    footer: {
                        text: client.user.username + " Bot List"
                    }
                }
            });
        }
    }
}