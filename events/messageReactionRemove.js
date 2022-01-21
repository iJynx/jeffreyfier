const logger = require("Logger");
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

    logger.log(`${reaction.message.id} was removed from ${reaction.message.id}`, "cmd");

    // get message object
    const message = await reaction.message.fetch();
    const authorID = message.author.id;
    const authorObj = await UserModel.findOne({ userID: authorID });

    // decrement jeffreyReactions and reactee and controversialMessages
    authorObj.jeffreyReactions--;

    if (authorObj.controversialMessages[message.id])
        authorObj.controversialMessages[message.id]--;

    // if reactee has less than 3 reactions remove it, else log it
    if (authorObj.reactees[reactee]) {
        authorObj.reactees[reactee]--;
    }

    // if jeffreyReactions is less than 0, remove the user
    if (authorObj.jeffreyReactions < 0) {
        authorObj.jeffreyReactions = 0;
    }


    // mark as modified
    authorObj.markModified('reactees');
    authorObj.markModified('controversialMessages');
    authorObj.markModified('jeffreyReactions');
    authorObj.save();
}
