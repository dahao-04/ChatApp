const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    type: {type: String, enum:['direct', 'group']},
    conversationId: {type: String, default: null},
    participant: [{type: mongoose.Schema.ObjectId, ref:'user'}],
    groupId: {type: mongoose.Schema.ObjectId, ref:'group', default: null},
    lastMessage: {
        from: {type: mongoose.Schema.ObjectId, ref:'user'},
        content: String,
        createAt: Date
    },
    updateAt: {type: Date, default: Date.now}
})

const Conversation = mongoose.model('conversation', conversationSchema);

module.exports = Conversation;