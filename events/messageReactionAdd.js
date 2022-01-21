const logger = require("Logger");
const { getSettings, permlevel } = require("../modules/functions.js");
const config = require("../config.js");
const mongoose = require('mongoose');
const { MessageEmbed } = require('discord.js');
const UserModel = require('../models/userModel');
const { trimEnd } = require("lodash");
// get reaction emote ID
module.exports = async (client, reaction, user) => {
    // check if the reaction is a custom emote

    // check if reaction is tick emote or not
    const tick = "%E2%9C%85"
    const cross = "%E2%9D%8C"
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
            if (crossReactions > tickReactions + 5) {
                // get message embed
                const embed = message.embeds[0];
                // get message author
                const jeffreyID = embed.author.name;
                const jeffreyRoleID = config.jeffreyRole;
                const memeberRoleID = config.memberRole;
                // remove jeffrey role from jeffrey
                const jeffrey = await client.users.fetch(jeffreyID);

                const guild = await client.guilds.cache.find(guild => guild.id === message.guild.id);
                const jeffreyRole = await guild.roles.fetch(jeffreyRoleID);
                const memeberRole = await guild.roles.fetch(memeberRoleID);
                // get jeffrey instance in guild
                let jef = await guild.members.fetch(jeffreyID);

                // remove jeffrey role from jeffrey
                await jef.roles.remove(jeffreyRole);
                // add memeber role to jeffrey
                await jef.roles.add(memeberRole);

                // remove all reactions
                await message.reactions.removeAll();
                // send message to jeffrey in private messages
                await jeffrey.send(`The council has voted! You have been allowed to rejoin the rest of the members in the server, and have had your jeffrey role removed from you. Welcome back!`);

                await message.react("❤️");
            }
        }
    }

    const reactee = user.id;
    if (reaction.emoji.identifier != config.jeffreyReaction)
        return

    // get message object
    const message = await reaction.message.fetch();
    // get author username
    const author = message.author.username;
    const settings = message.settings = getSettings(message.guild);

    // get author id
    const authorID = message.author.id;

    const userObj = await UserModel.findOne({ userID: authorID });

    // get roles of authorID
    const roles = message.member.roles.cache.map(r => r.id);

    // if author contains any of the godRoles, or doesnt have member role, quit
    if (roles.some(r => config.godRoles.includes(r)) || !roles.includes(config.memberRole)) {
        // logger.log(`${author} has a good role or is already jeffried, skipping.`, "cmd");
        return;
    }

    // if doesn't exist create one
    if (!userObj) {
        const newUser = new UserModel({
            userID: authorID,
            jeffreyReactions: 1,
            jeffreyOffences: 0,
            controversialMessages: { [message.id]: 1 },
            reactees: { [reactee]: 1 },
        });
        newUser.save();
        // logger.log(`${author} has been added to the database`, "log");
    } else {
        // if reactee has less than 3 reactions add it, else log it
        if (!userObj.reactees[reactee]) {
            // logger.log("Reactee added", "log");
            userObj.reactees[reactee] = 0;
        }
        const reacteeReacts = userObj.reactees[reactee];
        // logger.log(`${reactee} has ${reacteeReacts} reactions`, "log");
        if (userObj.reactees[reactee] >= settings.maxReactions) {
            // logger.log("has reacted too many times, will be exiting", "log");
            return;
        }

        userObj.reactees[reactee] = reacteeReacts + 1;

        // logger.log(`${author} has reacted to ${reactee}`, "log");

        // logger.log(`${author} has ${userObj.jeffreyReactions + 1} jeffrey reactions`, "log");
        userObj.jeffreyReactions++;

        // logger.log(`${JSON.stringify(userObj)}`, "log");
        // add to controversial messages
        if (!userObj.controversialMessages[message.id]) {
            userObj.controversialMessages[message.id] = 0
        }

        userObj.controversialMessages[message.id]++;
        // logger.log(`${JSON.stringify(userObj)}`, "log");

        // get threshold
        const threshold = settings.jeffreyThreshold;
        // print threshold

        if (userObj.jeffreyReactions >= threshold) {
            // author at
            const authorAt = await client.users.fetch(authorID);

            const directResponse = await message.channel.send(`${authorAt} has officially been jeffrified for getting ${userObj.jeffreyReactions} jeffrey votes. The council will now vote...`);
            // react to message with party emote
            directResponse.react("🎉");


            // add role jeffreyRole from config
            message.guild.members.cache.get(authorID).roles.add(config.jeffreyRole);
            // remove member role
            message.guild.members.cache.get(authorID).roles.remove(config.memberRole);

            // reset jeffries to 0
            userObj.jeffreyReactions = 0;
            // increment to jeffreyOffences
            userObj.jeffreyOffences++;

            // add log message in logs channel
            // get log channel based on ID
            const jeffreyLogsChannel = await message.guild.channels.cache.find(channel => channel.id === config.jeffreyLog);
            if (jeffreyLogsChannel) {
                // get reactee's name
                const reacteeName = message.guild.members.cache.get(reactee).displayName;
                //  mention reactee
                const reacteeMention = message.guild.members.cache.get(reactee).toString();

                // offender profile picture
                const offenderProfile = message.author.displayAvatarURL({ format: "png", dynamic: true, size: 1024 });

                // get author @ 
                const authorMention = message.author.toString();

                // get 1'st 2'nd 3'rd
                const suffix = ["st", "nd", "rd"];
                const suffixIndex = userObj.jeffreyOffences % 10;
                const suffixString = suffix[suffixIndex - 1] || "th";


                // get top 6 controversial messages and put them into an array of objects
                const topMessages = Object.keys(userObj.controversialMessages).sort((a, b) => userObj.controversialMessages[b] - userObj.controversialMessages[a]).slice(0, 6);
                const topMessagesArray = [];
                for (const messageID of topMessages) {
                    const Cmessage = await message.channel.messages.fetch(messageID);
                    topMessagesArray.push({
                        message: Cmessage.content,
                        link: `https://discordapp.com/channels/${Cmessage.guild.id}/${Cmessage.channel.id}/${Cmessage.id}`,
                        count: userObj.controversialMessages[messageID],
                    });
                }

                // limit each message content to 300 characaters and if exceedes add ...
                for (const message of topMessagesArray) {
                    if (message.message.length > 300) {
                        message.message = message.message.slice(0, 300) + "...";
                    }
                }

                // prepare top messages in inline fields
                // logger.log(topMessages, "log");

                // prepare vote embed
                const voteEmbed = new MessageEmbed()
                    .setColor('#FF3333')
                    .setTitle(`[VOTE] Was ${author}'s jeffriefication justified? **(${userObj.jeffreyOffences})**`)
                    .setDescription(`${authorMention} has been been officially sent to the jeffrey zoo by ${reacteeMention}. This is their ${userObj.jeffreyOffences}${suffixString} offence.

                    Here are their most controversial messages:`)
                    // render top 6 messages
                    .addFields(...[
                        topMessagesArray.map(m => {
                            return {
                                name: `${m.count} Jeffrey reactions`,
                                value: `[${m.message}](${m.link})`,
                                inline: true,
                            }
                        }),
                    ]
                    )
                    .setThumbnail(offenderProfile)
                    .setTimestamp()
                    .setAuthor(`${authorID}`, 'https://yt3.ggpht.com/E0JWTeCC-h9UMNFojHIKHblClsQM_B6oQtpXXOVggkIt6MngkWoJ-G27i2O78CFlqkKitfUan3o=s88-c-k-c0x00ffffff-no-rj', 'https://www.youtube.com/c/Hamza97')
                    .setFooter('React with ✅ if you think it\'s justified and ❌ if it was not.');
                // send message to disciple-vote channel and get the message
                const voteMessage = await jeffreyLogsChannel.send({ embeds: [voteEmbed] });

                // add reactions
                await voteMessage.react('✅');
                await voteMessage.react('❌');
            }
        }
        // new userObj value
        // logger.log(`${JSON.stringify(userObj)}`, "log");
        await userObj.markModified('reactees');
        await userObj.markModified('controversialMessages');
        await userObj.save();
    }
};
