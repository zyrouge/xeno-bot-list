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
                        icon_url: user.avatarURl()
                    },
                    description: `${botDB.dataValues.shortDesc}`,
                    fields: [
                        {
                            name: `Prefix`,
                            value: `${bot.dataValues.prefix}`,
                            inline: true
                        },
                        {
                            name: `Owner`,
                            value: `<@${bot.dataValues.ownerID}>`,
                            inline: true
                        },
                        {
                            name: `Links`,
                            value: [
                                `${bot.dataValues.botWebsite ? `**Website:** ${bot.dataValues.botWebsite}`: ""}`,
                                `${bot.dataValues.botServer ? `**Support Server:** https://discord.gg/${bot.dataValues.botServer}`: ""}`,
                                `**Invite:** ${bot.dataValues.customInvite || `https://discordapp.com/oauth2/authorize?client_id=${user.id}&scope=bot&permissions=0`}`
                            ].filter(x => x).join("\n"),
                            inline: true
                        },
                        {
                            name: `Tags`,
                            value: `${bot.dataValues.botTags.join(" ,")}`,
                            inline: true
                        },
                        {
                            name: `Upvotes`,
                            value: `**Today's Upvotes:** ${dailyUpvotes}\n**Total Upvotes:** ${bot.dataValues.totalUpvotes}`,
                            inline: true
                        },
                        {
                            name: `Guilds`,
                            value: `${bot.dataValues.guildsCount} Servers`,
                            inline: true
                        },
                        {
                            name: `Others`,
                            value: [
                                `**Submitted on:** ${new Date(bot.dataValues.submittedOn).toLocaleString()}`,
                                `**Approved on:** ${new Date(bot.dataValues.approvedOn).toLocaleString()}`,
                                `**Tested by:** <@${bot.dataValues.testedBy}>`
                            ].join("\n"),
                            inline: true
                        },
                    ],
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
                        icon_url: user.avatarURl()
                    },
                    description: `${botDB.map(bot => `<@${bot.dataValues.botID}>`).join("\n")}`,
                    timestamp: new Date(),
                    footer: {
                        text: client.user.username + " Bot List"
                    }
                }
            });
        }
    }
}