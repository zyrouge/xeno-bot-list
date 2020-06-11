const Xeno = require("./Xeno");

const client = new Xeno({
    disableMentions: "everyone"
});

client.load().then(() => client.connect());