module.exports = async (client, message) => {
    if(message.author.bot) return;

    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${client.config.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*`);
	if (!prefixRegex.test(message.content)) return;

	const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if(cmd) cmd.run(client, message, args);
};