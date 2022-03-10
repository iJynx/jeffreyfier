const { version, MessageEmbed } = require("discord.js");
const { DurationFormatter } = require("@sapphire/time-utilities");
const durationFormatter = new DurationFormatter();
const UserModel = require("../models/userModel");
const config = require("../config");
const { settings } = require("../modules/settings.js");

exports.run = async (client, message, args, level) => {
  // eslint-disable-line no-unused-vars
  // get message author object

  // check if message is reffering to another user
  let author = message.author;
  let targetID = author.id;
  if (args[0]) {
    targetID = args[0].replace(/[^\d]/g, "");
    author = await client.users.fetch(targetID);
  }
  console.log("targetID: " + targetID);

  // get author id
  // get user model
  const userObj = await UserModel.findOne({ userID: targetID });

  if (!userObj) {
    message.reply(
      `Wooo! You're not even in the Jeffrey database! You aren't close to becoming a Jeffrey.`
    );
  } else {
    // offender profile picture
    const offenderProfile = author.displayAvatarURL({
      format: "png",
      dynamic: true,
      size: 1024,
    });

    const topMessages = Object.keys(userObj.controversialMessages)
      .sort(
        (a, b) =>
          userObj.controversialMessages[b] - userObj.controversialMessages[a]
      )
      .slice(0, 6);
    const topMessagesArray = [];

    for (const messageFDB of topMessages) {
      try {
        const messageID = messageFDB.split("-")[1];
        const channelID = messageFDB.split("-")[0];

        const MessageObj = await message.guild.channels.cache
          .get(channelID)
          .messages.fetch(messageID);
        topMessagesArray.push({
          message: MessageObj.content,
          link: `https://discordapp.com/channels/${MessageObj.guild.id}/${MessageObj.channel.id}/${MessageObj.id}`,
          count: userObj.controversialMessages[messageFDB],
        });
      } catch {
        topMessagesArray.push({
          message: "Error loading message. Probably deleted.",
          link: "",
          count: userObj.controversialMessages[messageFDB],
        });
      }
    }

    for (const message of topMessagesArray) {
      if (message.message.length > 300) {
        message.message = message.message.slice(0, 300) + "...";
      }
    }
    // get settings
    const overrides = {
      ...settings.get(message.guild.id),
      ...settings.get("default"),
    };
      
      
      // settings.get(message.guild.id) || settings.get("default");

    const responseEmbed = new MessageEmbed()
      .setColor("#3333FF")
      .setTitle(`${author}'s Jeffrey stats`)
      .setDescription(
        `This account has ${userObj.jeffreyReactions} reactions and are ${
          overrides.jeffreyThreshold - userObj.jeffreyReactions
        } reactions from becoming a Jeffrey. They have ${
          userObj.jeffreyOffences
        } previous offence(s).

            "Here are their most controversial messages:`
      )
      // render top 6 messages
      .addFields(
        ...[
          topMessagesArray.map((m) => {
            return {
              name: `${m.count} Jeffrey reactions`,
              value: `[${m.message}](${m.link})`,
              inline: true,
            };
          }),
        ]
      )
      .setThumbnail(offenderProfile)
      .setTimestamp()
      .setAuthor(
        `Jeffrey-fier :D`,
        "https://yt3.ggpht.com/E0JWTeCC-h9UMNFojHIKHblClsQM_B6oQtpXXOVggkIt6MngkWoJ-G27i2O78CFlqkKitfUan3o=s88-c-k-c0x00ffffff-no-rj",
        "https://www.youtube.com/c/Hamza97"
      )
      .setFooter(`Written and maintained by Deleted User 0fd476ef#4008`);
    const jeffreyStats = await message.channel.send({
      embeds: [responseEmbed],
    });
    jeffreyStats.react(config.jeffreyReaction);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User",
};

exports.help = {
  name: "jeffrey",
  category: "Miscellaneous",
  description: "Tells you how close you are to becoming a Jeffrey",
  usage: "jeffrey",
};
