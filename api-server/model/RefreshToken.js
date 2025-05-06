const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token: String,
    userId: {type: mongoose.Schema.ObjectId, ref: 'user'},
    expiresAt: Date,
    createAt: Date
})

module.exports = mongoose.model('refreshtoken', refreshTokenSchema);