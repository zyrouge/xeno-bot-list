const chalk = require("chalk");
const time = () => (`${chalk.grey(new Date().toLocaleTimeString("in", { timeZone: "asia/kolkata", hour12: false }))}`);

module.exports = class Logger {
    constructor() {}

    log(content) {
        return console.log(`${time()} ${chalk.blueBright("INFO")} ${content}`);
    }

    warn(content) {
        return console.log(`${time()} ${chalk.yellowBright("WARN")} ${content}`);
    }

    error(content) {
        return console.log(`${time()} ${chalk.redBright("ERR!")} ${content}`);
    }
}