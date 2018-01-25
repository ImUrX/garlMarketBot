const config = require("./config.json");
const Discord = require("discord.js");
const snoowrap = require("snoowrap");
let lastPost = null;

const client = new Discord.Client();

const r = new snoowrap({
    userAgent: "GarlicCoinsFuture v1.0.0",
    clientId: config.reddit.clientId,
    clientSecret: config.reddit.clientSecret,
    refreshToken: config.reddit.refreshToken
});

async function reddit() {
    const object = lastPost === null ? { limit: 1 } : { limit: 1, before: lastPost };
    const listing = await r.getSubreddit("GarlicMarket").getNew(object);
    const json = JSON.parse(JSON.stringify(listing));
    if(!json[0]) return;
    lastPost = json[0].name;
    const embed = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setAuthor(json[0].author, null, `https://www.reddit.com/user/${json[0].author}`)
        .setTitle(json[0].title)
        .setURL(json[0].url)
        .setDescription(json[0].selftext);
    client.channels.get(config.channel).send("**New post at /r/GarlicMarket!**", { embed });
}

client.on("ready", () => {
    console.log("I am ready!");
    client.setInterval(reddit, 20 * 1000);
});

client.login(config.token);