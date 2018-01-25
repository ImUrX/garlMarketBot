const config = require("./config.json");
const Discord = require("discord.js");
const snoowrap = require("snoowrap");
const djsversion = require("./node_modules/discord.js/package.json");
const botversion = require("./package.json");
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
    client.channels.get(config.channelNotification).send("**New post at /r/GarlicMarket!**", { embed });
    console.log(`Sent a new message about ${json[0].title} with ID ${json[0].name}`);
}

client.on("ready", () => {
    console.log("I am ready to smell garlic!");
    client.setInterval(reddit, 20 * 1000);
});

const cmds = {
    "botstats": function(data) {
        const embed = new Discord.MessageEmbed()
            .setColor("PURPLE")
            .addField("Uptime:", uptime(process.uptime()), true)
            .addField("Current RAM usage:", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`, true)
            .addField("Node.js Version:", process.version, true)
            .addField("Bot's Version:", `v${botversion.version}`, true)
            .addField("Discord.js Version:", `v${djsversion.version}`, true);
        return data.channel.send("**Statistics**", { embed });
    },
    "restart": async function (data) {
        if(!data.guild) return;
        if(!data.member.permissions.has("MANAGE_GUILD")) return;
        await data.channel.send("Restarting...");
        process.exit();
    },
    "help": function (data) {
        data.channel.send("**Commands**: " + Object.keys(cmds).join(", "));
    }
};

client.on("message", data => {
    if(!data.content.startsWith(config.prefix)) return;
    const command = data.content.substr(config.prefix.length).split(" ");
    if (!(command[0] in cmds) || !(config.botChannel.includes(data.channel.guild.id))) return;
    cmds[command[0]](data, command[1]);
});

client.login(config.token);

function uptime(seconds) {
    const numdays = Math.floor((seconds % 31536000) / 86400);
    const numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    const numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    return (numdays + "d " + numhours + "h " + numminutes + "m");
}