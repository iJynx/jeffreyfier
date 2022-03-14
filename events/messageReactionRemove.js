/* eslint-disable indent */
const logger = require("../modules/Logger");
const config = require("../config.js");

// import UserModel commonjs
const UserModel = require("../models/userModel");

module.exports = async (client, reaction, user) => {
    // check which reaction was removed
    const reactee = user.id;
    if (reaction.emoji.identifier != config.jeffreyReaction) return;

    // check if the message is a message from one of the god roles
    const message = await reaction.message.fetch();

    // get message object
    const authorID = message.author.id;
    // fetch roles of author in server
    const authorDiscordObject = await message.guild.members.fetch(authorID);
    // check if author has god role
    if (authorDiscordObject.roles.cache.some((role) => config.godRoles.includes(role.id))) {
        console.log("leaving cus god role");
        return;
    }
    const reacteeGuildObject = await message.guild.members.fetch(reactee);
    const reacteeRoles = reacteeGuildObject.roles.cache.map((role) => role.id);
    let multiplier = 1;
    if (reacteeRoles.includes(config.discipleRole)) {
        multiplier = 5;
    } else if (reacteeRoles.includes(config.acolyteRole)) {
        multiplier = 2;
    }

    const authorObj = await UserModel.findOne({ userID: authorID });
    try {
        // decrement jeffreyReactions and reactee and controversialMessages
        authorObj.jeffreyReactions -= 1 * multiplier;
        // get channel id
        const channelID = message.channel.id;
        if (authorObj.controversialMessages[channelID + "-" + message.id])
            authorObj.controversialMessages[channelID + "-" + message.id] -= multiplier;

        // if reactee has less than 3 reactions remove it, else log it
        if (authorObj.reactees[reactee]) {
            authorObj.reactees[reactee] -= 1;
        }

        // if jeffreyReactions is less than 0, remove the user
        if (authorObj.jeffreyReactions < 0) {
            authorObj.jeffreyReactions = 0;
        }

        // if there are any controversial messages with a count of 0, remove them
        const keys = Object.keys(authorObj.controversialMessages);
        for (const key of keys) {
            if (authorObj.controversialMessages[key] == 0) {
                delete authorObj.controversialMessages[key];
            }
        }
    } catch (err) {
        logger.log("looks like someone unreacted to a disciple", "error");
    }

    // mark as modified
    authorObj.markModified("reactees");
    authorObj.markModified("controversialMessages");
    authorObj.markModified("jeffreyReactions");
    authorObj.save();
};
