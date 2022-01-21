const mongoose = require('mongoose');

// define user model
const UserModel = mongoose.model('User', {
    userID: String,
    jeffreyReactions: Number,
    jeffreyOffences: Number,
    controversialMessages: {},
    reactees: {},
});


// export using commonjs
module.exports = UserModel;