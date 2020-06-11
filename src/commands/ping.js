module.exports = {
    name: "ping",
    aliases: ["pong", "test"],
    run: async (client, message, args) => (message.channel.send(`:ping_pong: Pong! \`${client.ws.ping}ms\``))
}