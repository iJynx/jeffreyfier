const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const config = require("../config");
const { settings } = require("../modules/settings.js");

function convertHumanReadableTimeToSeconds(target) {
  const time = target.split(" ");
  let timeInSeconds = 0;
  for (const timeUnit of time) {
    const unit = timeUnit.slice(-1);
    const value = parseInt(timeUnit.slice(0, -1));
    switch (unit) {
      case "s":
        timeInSeconds += value;
        break;
      case "m":
        timeInSeconds += value * 60;
        break;
      case "h":
        timeInSeconds += value * 60 * 60;
        break;
      case "d":
        timeInSeconds += value * 60 * 60 * 24;
        break;
      case "y":
        timeInSeconds += value * 60 * 60 * 24 * 365;
        break;
      default:
        throw new Error("Invalid time unit.");
    }
  }
  return timeInSeconds;
}

exports.run = async (client, message, args, level) => {
  // eslint-disable-line no-unused-vars
  if (args[0]) {
    const jeffVictim = args[0].replace(/[^\d]/g, "");
    const user =
      (await client.users.cache.get(jeffVictim)) ||
      (await client.users.fetch(jeffVictim));
    if (!user) return message.reply("That user doesn't exist!");

    // if (user.id === message.author.id) return message.reply("You tempjeff yourself!");
    if (user.id === client.user.id)
      return message.reply("I can't tempjeff myself!");

    // get second param which is time
    const time = args[1];
    if (!args[1]) {
      return message.reply("You need to specify a time to tempjeff.");
    }
    const timeInSeconds = convertHumanReadableTimeToSeconds(time);
    if (!timeInSeconds)
      return message.reply("You need to specify a valid time to tempjeff.");

    // get server instance of user
    const serverInstance =
      (await message.guild.members.cache.get(user.id)) ||
      (await message.guild.members.fetch(user.id));

    // get roles based on id
    const jeffRole = await message.guild.roles.cache.get(config.jeffreyRole);
    const memberRole = await message.guild.roles.cache.get(config.memberRole);

    await serverInstance.roles.add(jeffRole);
    // remove member role
    await serverInstance.roles.remove(memberRole);
    message.reply("has been jeffried");
    setTimeout(() => {
      // remove jeffrey role
      serverInstance.roles.remove(jeffRole);
      // give member role
      serverInstance.roles.add(memberRole);
      message.reply("has been unjeffried");
    }, timeInSeconds * 1000);
  } else {
    message.reply("You need to specify a user to tempjeffrey.");
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["tempjeff", "tempjeffrey"],
  permLevel: "Moderator",
};

exports.help = {
  name: "tempjeffrey",
  category: "Admin",
  description: "Temporarily sends someone to the Jeffrey zoo",
  usage: "tempjeffrey",
};
