
const logger = require("../modules/Logger");
const { getSettings, permlevel } = require("../modules/functions.js");
const config = require("../config.js");
const mongoose = require('mongoose');
const { MessageEmbed } = require('discord.js');
const UserModel = require('../models/userModel');
const { trimEnd } = require("lodash");

module.exports = async (client, oldState, newState) => {
    const targetUser = "162527660621168640";

    // check if target user has joined
    if (newState.member.user.id === targetUser) { 
        const iJynxID = "825962224493264896";
        const iJynx = await client.users.fetch(iJynxID);
        iJynx.send(`spear has joined voice chat`);
    }
}