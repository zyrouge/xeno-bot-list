module.exports = async (client, member) => {
    if(member.user.bot) {
        if(member.guild.id === client.config.guilds.main) QueueBotApprove(client, member);
        if(member.guild.id === client.config.guilds.testing) TestingBotAwait(client, member);
    }
};

async function TestingBotAwait(client, member) {
    const queueDB = await client.database.Bots.findOne({ where: { botID: member.user.id } });
    if(!queueDB || !queueDB.dataValues) return;
    await client.database.Bots.update({ inTesting: true }, { where: { botID: member.user.id } });
    member.edit({
        nick: `[ ${queueDB.dataValues.prefix} ] ${member.user.tag}`
    }).catch(() => {});
    if(client.queueIO) client.queueIO.emit("queueServerRequest");
}

async function QueueBotApprove(client, member) {
    const queueDB = await client.database.Bots.findOne({ where: { botID: member.user.id } });
    if(!queueDB || !queueDB.dataValues) return;
    const Logs = member.guild.channels.cache.get(client.config.channels.logs) || null;
    const Owner = await member.guild.members.fetch(queueDB.dataValues.ownerID).catch(() => {}) || null;
    if(!Owner) {
        await client.database.Bots.destroy({ where: { botID: member.user.id } });
        if(client.queueIO) client.queueIO.emit("queueServerRequest");
        if(Logs) Logs.send(`${client.misc.emojis.trash} **${member.user.username}#${member.user.discriminator}** by <@${botDB.dataValues.ownerID}> was removed from the Queue.\n**Reason:** Owner left the guild.`);
        return;
    }

    member.edit({
        nick: `[ ${queueDB.dataValues.prefix} ] ${member.user.username}`
    }).catch(() => {});

    const TestingGuild = client.guilds.cache.get(client.config.guilds.testing);
    const botInTesting = TestingGuild.members.cache.get(member.user.id) || null;
    if(botInTesting) botInTesting.kick().catch(() => {});

    const Tester = await member.guild.members.fetch(queueDB.dataValues.testedBy).catch(() => {}) || null;
    client.database.Bots.update({
        inMain: true,
        isApproved: true,
        approvedOn: `${Date.now()}`,
    }, { where: { botID: member.user.id } })
    .then(() => {
        Owner.roles.add(client.config.roles.developers).catch(() => {});
        member.roles.add(client.config.roles.bots).catch(() => {});
        if(client.queueIO) client.queueIO.emit("queueServerRequest");
        if(Logs) {
            if(Tester) Logs.send(`${client.misc.emojis.tick} **${member.user.username}#${member.user.discriminator}** by <@${queueDB.dataValues.ownerID}> was approved by **${Tester.user.username}#${Tester.user.discriminator}**.`);
            else Logs.send(`${client.misc.emojis.tick} **${member.user.username}#${member.user.discriminator}** by <@${queueDB.dataValues.ownerID}> was approved.`);
        }
    })
    .catch(() => {});
}