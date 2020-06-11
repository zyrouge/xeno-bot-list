module.exports = async (client, message) => {
    if(message.channel.id !== client.config.channels.invite) return;

    const content = message.content.trim();
    const args = content.split(/ +/);

    message.delete().catch(() => {});

    const embed = {
        title: null,
        author: {
            name: null,
            icon_url: null,
        },
        description: null,
        fields: [],
        thumbnail: { url: null },
        color: client.config.color,
        footer: {
            text: null,
            icon_url: null
        }
    }

    if(!(args.length >= 2)) {
        return message.channel.send({ embed: {
            ...embed,
            author: {
                name: "Invalid Format",
                icon_url: `${client.misc.emojis.cross.url}`
            },
            fields: [
                { name: "Usage", value: "`<BOT_ID> <PREFIX>`", inline: true },
                { name: "Example", value: `\`${client.user.id} ${client.config.prefix}\``, inline: true },
            ],
        } }).then(msg => msg.delete({ timeout: 4000 }));
    }

    const bot = !isNaN(args[0]) ? ((await client.users.fetch(args[0])) || null) : null;
    if(isNaN(args[0]) || !bot || !bot.bot) {
        return message.channel.send({ embed: {
            ...embed,
            author: {
                name: "Invalid Bot ID",
                icon_url: `${client.misc.emojis.cross.url}`
            },
            fields: [
                { name: "Usage", value: "`<BOT_ID> <PREFIX>`", inline: true },
                { name: "Example", value: `\`${client.user.id} ${client.config.prefix}\``, inline: true },
            ],
            thumbnail: { url: bot && bot.avatar ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.${bot.avatar.includes("a_") ? "gif" : "png"}?size=1280` : null }
        } }).then(msg => msg.delete({ timeout: 4000 }));
    }

    if(message.guild.members.cache.has(bot.id)) {
        
        return message.channel.send({ embed: {
            ...embed,
            author: {
                name: "Bot is already in the Server",
                icon_url: `${client.misc.emojis.cross.url}`
            },
            thumbnail: { url: bot && bot.avatar ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.${bot.avatar.includes("a_") ? "gif" : "png"}?size=1280` : null }
        } }).then(msg => msg.delete({ timeout: 4000 }));
    }

    const Logs = message.guild.channels.cache.get(client.config.channels.logs) || null;
    if(!Logs) return;

    try {
        await client.database.Queue.create({
            botID: bot.id,
            prefix: `${args[1]}`
        });

        Logs.send(`${client.misc.emojis.ticket} ${message.author} added **${bot.username}#${bot.discriminator}** to the queue.`);

        return message.channel.send({ embed: {
            ...embed,
            author: {
                name: "Bot was added to the Queue",
                icon_url: `${client.misc.emojis.tick.url}`
            },
            thumbnail: { url: bot && bot.avatar ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.${bot.avatar.includes("a_") ? "gif" : "png"}?size=1280` : null },
            fields: [{
                name: "Details",
                value: `**Tag:** ${bot.username}#${bot.discriminator}\n**Owner:** ${message.author.tag}\n**Prefix:** ${args[1]}`
            }]
        } });
    } catch(e) {
        return message.channel.send({ embed: {
            ...embed,
            author: {
                name: "Bot is already in the Queue",
                icon_url: `${client.misc.emojis.cross.url}`
            },
            description: "Approving might take a while, we are humans too!",
            thumbnail: { url: bot && bot.avatar ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.${bot.avatar.includes("a_") ? "gif" : "png"}?size=1280` : null }
        } }).then(msg => msg.delete({ timeout: 4000 }));
    }
};