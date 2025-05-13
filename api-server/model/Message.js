const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    type: {type: String, enum: ['direct', 'group']},
    from: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    to: {type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null},
    groupId: {type: mongoose.Schema.Types.ObjectId, ref: 'group', default: null},
    content: {type: String, default: ""},
    imageUrl: {type: String, default: null},
    createAt: {type: Date, default: Date.now}
})

module.exports = mongoose.model('message', MessageSchema);