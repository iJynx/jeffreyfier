/* eslint-disable linebreak-style */
const logger = require("../modules/Logger");
const { getSettings } = require("../modules/functions.js");
const config = require("../config.js");
const { MessageEmbed } = require("discord.js");
const UserModel = require("../models/userModel");
// get reaction emote ID
module.exports = async (client, reaction, user) => {
  // check if the reaction is a custom emote

  // check if reaction is tick emote or not
  const tick = "%E2%9C%85";
  const cross = "%E2%9D%8C";
  if (reaction.emoji.identifier == tick || reaction.emoji.identifier == cross) {
    // check reaction is in jeffreyLog channel
    // check reaction isnt by a bot
    if (reaction.message.channel.id != config.jeffreyLog || user.bot) return;

    // find reactions by reactee on message
    const message = await reaction.message.fetch();
    const reactee = user.id;
    // get reactions of tick
    const json = message.reactions.cache.toJSON();
    const tickReactions = json[0].users.reaction.count;
    const crossReactions = json[1].users.reaction.count;
    // if both exist
    if (tickReactions && crossReactions) {
      // if cross is larger than tick + 5
      if (crossReactions > tickReactions + 4) {
        // get message embed
        const embed = message.embeds[0];
        // get message author
        const jeffreyID = embed.author.name;
        const jeffreyRoleID = config.jeffreyRole;
        const memeberRoleID = config.memberRole;
        // remove jeffrey role from jeffrey
        const jeffrey = await client.users.fetch(jeffreyID);

        const guild = await client.guilds.cache.find(
          (guild) => guild.id === message.guild.id
        );
        const jeffreyRole = await guild.roles.fetch(jeffreyRoleID);
        const memeberRole = await guild.roles.fetch(memeberRoleID);
        // get jeffrey instance in guild
        const jef = await guild.members.fetch(jeffreyID);

        // remove jeffrey role from jeffrey
        await jef.roles.remove(jeffreyRole);
        // add memeber role to jeffrey
        await jef.roles.add(memeberRole);

        // remove all reactions
        await message.reactions.removeAll();
        // send message to jeffrey in private messages
        await jeffrey.send(
          "The council has voted! You have been allowed to rejoin the rest of the members in the server, and have had your jeffrey role removed from you. Welcome back!"
        );

        await message.react("❤️");
      }
    }
  }

  const reactee = user.id;
  if (reaction.emoji.identifier != config.jeffreyReaction) return;

  // get message object
  const message = await reaction.message.fetch();
  // get author username
  const author = message.author.username;
  const settings = (message.settings = getSettings(message.guild));

  // get author id
  const authorID = message.author.id;
  const userObj = await UserModel.findOne({ userID: authorID });

  // get roles of authorID
  const roles = message.member.roles.cache.map((r) => r.id);
  // find channel the message was sent it

  const channel = message.channel.id;

  // if author contains any of the godRoles, or doesnt have member role, quit
  if (
    roles.some((r) => config.godRoles.includes(r)) ||
    !roles.includes(config.memberRole)
  ) {
    return;
  }
  console.log("1");

  // if doesn't exist create one
  if (!userObj) {
    const newUser = new UserModel({
      userID: authorID,
      jeffreyReactions: 1,
      jeffreyOffences: 0,
      controversialMessages: { [channel + "-" + message.id]: 1 },
      reactees: { [reactee]: 1 },
      blacklist: {
        endTime: 0,
        reason: "",
      },
    });
    newUser.save();
  } else {
    console.log("11");

    // if reactee has less than 3 reactions add it, else log it
    if (!userObj.reactees[reactee]) {
      userObj.reactees[reactee] = 0;
    }
    console.log("12");
    const reacteeReacts = userObj.reactees[reactee];
    if (userObj.reactees[reactee] >= settings.maxReactions) {
      return;
    }
    console.log("13");

    userObj.reactees[reactee] = reacteeReacts + 1;
    const authorAt = message.author;

    userObj.jeffreyReactions++;
    // add to controversial messages
    console.log("14");

    if (!userObj.controversialMessages[channel + "-" + message.id]) {
      userObj.controversialMessages[channel + "-" + message.id] = 0;
    }
    console.log("15");

    userObj.controversialMessages[channel + "-" + message.id]++;
    // logger.log(`${JSON.stringify(userObj)}`, "log");
    console.log("2");

    // get threshold
    const threshold = settings.jeffreyThreshold;
    // print threshold

    if (userObj.jeffreyReactions >= threshold) {
      // author at

      message.channel
        .send(
          `${authorAt} has officially been jeffrified for getting ${userObj.jeffreyReactions} jeffrey votes. The council will now vote...`
        )
        .then(async (msg) => {
          // msg.react("🎉");
          // msg.react("💔");
          msg.react("💀");
          // msg.react("✅");
          // msg.react("❌");
        });
      // react to message with party emote
      try {
        // send message to author telling them they've been automatically jeffried
        authorAt.send(
          `You have been automatically jeffrified for getting ${userObj.jeffreyReactions} jeffrey votes. Please wait for mods to revoke this or for the council will now vote...`
        );
      } catch {
        logger.log("cant send dm to user");
      }
      console.log("3");

      // add role jeffreyRole from config
      message.guild.members.cache.get(authorID).roles.add(config.jeffreyRole);
      // remove member role
      message.guild.members.cache.get(authorID).roles.remove(config.memberRole);

      // reset jeffries to 0
      userObj.jeffreyReactions = 0;

      // save asap
      userObj.markModified("reactees");
      userObj.markModified("controversialMessages");
      userObj.markModified("jeffreyReactions");
      userObj.save();

      // add log message in logs channel
      // get log channel based on ID
      const jeffreyLogsChannel = await message.guild.channels.cache.find(
        (channel) => channel.id === config.jeffreyLog
      );

      if (jeffreyLogsChannel) {
        logger.log(
          `${author} has been jeffrified for ${userObj.jeffreyReaction} offences.`,
          "log"
        );
        console.log("4");

        //  mention reactee
        const reacteeMention = message.guild.members.cache
          .get(reactee)
          .toString();

        // offender profile picture
        const offenderProfile = message.author.displayAvatarURL({
          format: "png",
          dynamic: true,
          size: 1024,
        });

        // get author @
        const authorMention = message.author.toString();

        // get 1'st 2'nd 3'rd
        const suffix = ["st", "nd", "rd"];
        const suffixIndex = userObj.jeffreyOffences % 10;
        const suffixString = suffix[suffixIndex - 1] || "th";

        const promises = [];

        // get top 6 controversial messages and put them into an array of objects
        const topMessages = Object.keys(userObj.controversialMessages)
          .sort(
            (a, b) =>
              userObj.controversialMessages[b] -
              userObj.controversialMessages[a]
          )
          .slice(0, 6);
        const topMessagesArray = [];

        for (const messageFDB of topMessages) {
          try {
            const messageID = messageFDB.split("-")[1];
            const channelID = messageFDB.split("-")[0];

            promises.push(
              (message.guild.channels.cache
                .get(channelID) || client.channels.fetch(channelID))
                .messages.fetch(messageID)
                .then(async (msg) => {
                  topMessagesArray.push({
                    channel: msg.channel.name,
                    message: msg.content,
                    link: `https://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`,
                    count: userObj.controversialMessages[messageFDB],
                  });
                }).catch(() => {
                  console.log("looking for " + userObj.userID);
                  const msg_filter = (m) => m.author.id === userObj.userID;
                  const channelOBJ = client.channels.cache.get(channelID) || client.channels.fetch(channelID);

                  // print channel obj id
                  console.log("found chanel obj:" + channelOBJ.id);

                  const messages = channelOBJ.awaitMessages(msg_filter, {
                    max: 1,
                    time: 1,
                  });

                  messages.then((msgs) => {
                    console.log("found messages");
                    console.log(msgs);
                    console.log(msgs.first());
                    console.log(msgs.first().content);
                  }).catch(() => {
                    console.log("no messages found");
                  }).ti


                  // .then((msgs) => {
                  //   console.log("found " + msgs.size);
                  //   const msg = msgs.find((m) => m.id === messageID);
                  //   topMessagesArray.push({
                  //     channel: msg.channel.name,
                  //     message: msg.content,
                  //     link: `https://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`,
                  //     count: userObj.controversialMessages[messageFDB],
                  //   });
                  // }).catch(() => {
                  //   console.log("failed " + userObj.userID);
                  //   topMessagesArray.push({
                  //     message: "Error loading message. Probably deleted.",
                  //     link: "",
                  //     count: userObj.controversialMessages[messageFDB],
                  //   });
                  // });
                })
            );
          }
          catch (e) {
            logger.log(e, "error");
            topMessagesArray.push({
              message: "Error loading message. Probably deleted.",
              link: "",
              count: userObj.controversialMessages[messageFDB],
            });
          }
        }
        console.log("5");

        await Promise.all(promises);
        console.log("6");

        // limit each message content to 300 characaters and if exceedes add ...
        for (const message of topMessagesArray) {
          if (message.message.length > 300) {
            message.message = message.message.slice(0, 300) + "...";
          }
        }
        const voteEmbed = new MessageEmbed()
          .setColor("#FF3333")
          .setTitle(
            `[VOTE] Was ${author}'s jeffriefication justified? **(${userObj.jeffreyOffences})**`
          )
          .setDescription(
            `${authorMention} has been been officially sent to the jeffrey zoo by ${reacteeMention}. This is their ${userObj.jeffreyOffences}${suffixString} offence.

                    Here are their most controversial messages:`
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
            `${authorID}`,
            "https://yt3.ggpht.com/E0JWTeCC-h9UMNFojHIKHblClsQM_B6oQtpXXOVggkIt6MngkWoJ-G27i2O78CFlqkKitfUan3o=s88-c-k-c0x00ffffff-no-rj",
            "https://www.youtube.com/c/Hamza97"
          )
          .setFooter(
            "React with ✅ if you think it's justified and ❌ if it was not."
          );
        // send message to disciple-vote channel and get the message
        const voteMessage = await jeffreyLogsChannel.send({
          embeds: [voteEmbed],
        });
        console.log("7");

        // add reactions
        await voteMessage.react("✅");
        voteMessage.react("❌");
      }
    } else {
      userObj.markModified("reactees");
      userObj.markModified("controversialMessages");
      userObj.markModified("jeffreyReactions");
      userObj.save();
    }
  }
};
