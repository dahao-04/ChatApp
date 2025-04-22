const mogoose = require('mongoose');

const GroupSchema = new mogoose.Schema({
    group_name: String,
    host_id: {type: mogoose.Schema.ObjectId, ref: 'user'},
    members_id: [{type: mogoose.Schema.ObjectId, ref: 'user'}],
    lastMessageSeq: {type: Number, default: 0},
    createAt: {type: Date, default: Date.now}
})

module.exports = mogoose.model('group', GroupSchema);