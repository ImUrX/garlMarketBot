const config = require("./config.json");
const Discord = require("discord.js");
const snoowrap = require("snoowrap");

const client = new Discord.Client();

const r = new snoowrap({
    userAgent: "GarlicCoinsFuture v1.0.0",
    clientId: config.reddit.clientId,
    clientSecret: config.reddit.clientSecret,
    refreshToken: config.reddit.refreshToken
});

async function reddit() {
    r.getSubreddit("GarlicMarket").getNew().then(console.log);
}

client.on("ready", () => {
    console.log("I am ready!");
    client.setInterval(reddit, 20 * 1000);
});

client.login(config.token);