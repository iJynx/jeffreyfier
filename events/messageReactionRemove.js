const logger = require("../modules/Logger");
const { getSettings, permlevel } = require("../modules/functions.js");
const config = require("../config.js");
const mongoose = require('mongoose');

// import UserModel commonjs
const UserModel = require('../models/userModel');

module.exports = async (client, reaction, user) => {
    // check which reaction was removed
    const reactee = user.id;
    if (reaction.emoji.identifier != config.jeffreyReaction)
        return

    // check if the message is a message from one of the god roles
    const message = await reaction.message.fetch();
    
    // if user has god role ignore
    if (message.member.roles.cache.some(role => config.godRoles.includes(role.id)))
        return;

    logger.log(`${reaction.message.id} was removed from ${reaction.message.id}`, "cmd");

    // get message object
    const authorID = message.author.id;
    const authorObj = await UserModel.findOne({ userID: authorID });
    try {

        // decrement jeffreyReactions and reactee and controversialMessages
        authorObj.jeffreyReactions--;
        // get channel id
        const channelID = message.channel.id;
        if (authorObj.controversialMessages[channelID + "-" + message.id])
            authorObj.controversialMessages[channelID + "-" + message.id]--;

        // if reactee has less than 3 reactions remove it, else log it
        if (authorObj.reactees[reactee]) {
            authorObj.reactees[reactee]--;
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
        logger.log(`looks like someone unreacted to a disciple`, "error");
    }


    // mark as modified
    authorObj.markModified('reactees');
    authorObj.markModified('controversialMessages');
    authorObj.markModified('jeffreyReactions');
    authorObj.save();
}
