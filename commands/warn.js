const { MessageEmbed } = require("discord.js");
const UserModel = require('../models/userModel');
const config = require("../config");


exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    author = null;

    if (args[0]) {
        targetID = args[0].replace(/[^\d]/g, "");
        author = await client.users.fetch(targetID);
    }

    if (targetID != "") {
        const channel = client.channels.cache.get(config.rules_and_guidelines_channel);
        await message.channel.send(`Warning to ${author} to not be a jeffrey. Please familierize your with ${channel}`);
    }
    console.log("Command Executed.")
};


exports.conf = {
    enabled: false,
    guildOnly: true, //no-clue what this does tbh
    aliases: [],
    permLevel: "Moderator"
};


exports.help = {
    name: "warn",
    category: "Miscellaneous",
    description: "Warns user that their activity is inappropriate. This will also send notify them to familiarise themselves with the rules-and-guidelines chanel.",
    usage: "warn"
};