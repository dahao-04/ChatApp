const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    user_email: String,
    user_name: {type: String, default: "New User"},
    user_password: String,
    createAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model("user", UserSchema);