class Emoji {
    constructor(emoji) { this.emoji = emoji; this.array = this.emoji.replace(/(<|>)/g, "").split(":"); if(this.array.length !== 3) throw new TypeError("Invalid Emoji"); }
    get name() { return this.array[1]; }
    get id() { return this.array[2]; }
    get animated() { return !!(this.array[0] === "a"); }
    get url() { return `https://cdn.discordapp.com/emojis/${this.id}.${this.animated ? "gif" : "png"}` }
    toString() { return this.emoji; }
}

module.exports = {
    tick: new Emoji("<:tick_box:720569924761944085>"),
    cross: new Emoji("<:cross_box:720569991111639081>"),
    ticket: new Emoji("<:two_tickets:720569990603866212>"),
    trash: new Emoji("<:trash_delete:720947943711965266>")
}