const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const durationFormatter = new DurationFormatter();

exports.run = (client, message, args, level) => {
  // eslint-disable-line no-unused-vars
  if (args[0]) {
    const banVictim = args[0].replace(/[^\d]/g, "");
    const user = client.users.cache.get(banVictim);
    if (!user) return message.reply("That user doesn't exist!");

    if (user.id === message.author.id)
      return message.reply("You can't ban yourself!");
    if (user.id === client.user.id) return message.reply("I can't ban myself!");
    // ban them
    const reason = args.slice(1).join(" ") || "No reason provided";

    message.guild.members.ban(user, { reason: reason });
    message.reply(
      `${user.tag} has been banished from the lands. Don't need to worry about him no more.`
    );
  } else {
    message.reply("You need to specify a user to ban.");
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["begone"],
  permLevel: "Administrator",
};

exports.help = {
  name: "Ban",
  category: "Admin",
  description: "Bans user",
  usage: "ban",
};
