module.exports = class Func {
    constructor(client) {
        this.client = client;
    }

    isStaff(userID) {
        return new Promise(async (resolve, reject) => {
            try {
                const guild = this.client.guilds.cache.get(this.client.config.guilds.main) || null;
                if (!guild) return resolve(false);
                const member = await guild.members.fetch(userID) || null;
                if (!member) return resolve(false);
                if (
                    member.roles.cache.has(this.client.config.roles.website) ||
                    member.roles.cache.has(this.client.config.roles.tester)
                ) return resolve(true);
                return resolve(false);
            } catch (e) {
                resolve(false);
            }
        });
    }
}