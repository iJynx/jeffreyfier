const { version } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const { DurationFormatter } = require("@sapphire/time-utilities");
const durationFormatter = new DurationFormatter();
const UserModel = require('../models/userModel');


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

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars

  // if no args then cancel
  if (!args[0]) return message.reply("Please provide a user to blacklist.");
  if (!args[1]) return message.reply("Please provide a duration for the blacklist.");
  if (!args[2]) return message.reply("Please provide a reason for the blacklist.");

  // get the user to blacklist
  let userID = message.mentions.users.first();

  // if no user then check args[0] and if it's a valid user then use that
  if (!user) {
    userID = args[0];
  }

  // get user from database
  const userObj = await UserModel.findOne({ userID: user.id });

  // if no user then create it
  if (!userObj) {
    // create user
    const newUser = new UserModel({
      userID: args[0],
      jeffreyReactions: 0,
      jeffreyOffences: 0,
      controversialMessages: {},
      reactees: {},
      blacklist: {
        endTime: 0,
        reason: ""
      }
    })
  }

  // if user is already blacklisted then cancel
  if (userObj.blacklist.endTime > Date.now()) return message.reply("That user is already blacklisted.");

  

  // get the reason for the blacklist
  const reason = args.slice(2).join(" ");

  // get the duration for the blacklist
  const duration = args[1];
  const time = convertHumanReadableTimeToSeconds(duration) * 1000;

  if (args[0]) {
    const banVictim = args[0].replace(/[^\d]/g, "");
    const user = client.users.cache.get(banVictim);
    if (!user) return message.reply("That user doesn't exist!");

    if (user.id === message.author.id) return message.reply("You can't ban yourself!");
    if (user.id === client.user.id) return message.reply("I can't ban myself!");
    // ban them
    const reason = args.slice(1).join(" ") || "No reason provided";
    message.guild.members.ban(user, { reason: reason });
    message.reply(`${user.tag} has been banished from the lands. Don't need to worry about him no more.`);
  } else {
    message.reply("You need to specify a user to ban.");
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["blacklist"],
  permLevel: "Moderator"
};

exports.help = {
  name: "blacklist",
  category: "Admin",
  description: "Blacklists user",
  usage: "blacklist"
};
