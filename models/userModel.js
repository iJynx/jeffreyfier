const mongoose = require('mongoose');

// define user model
const UserModel = mongoose.model('User', {
    userID: String,
    jeffreyReactions: Number,
    jeffreyOffences: Number,
    controversialMessages: {},
    reactees: {},
    blacklist: {
        endTime: Number,
        reason: String
    }
});


// export using commonjs
module.exports = UserModel;