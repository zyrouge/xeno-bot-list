module.exports = async (client) => {
    client.user.setPresence({ activity: { name: "https://botlist.zyrouge.gq | Xeno Bot List", type: "WATCHING" }, status: 'idle' });
    client.logger.log(`Logged in as ${client.user.tag}`);
}