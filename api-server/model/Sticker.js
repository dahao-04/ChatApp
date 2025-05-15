const mongoose = require('mongoose');

const stickerSchema = new mongoose.Schema({
    name: String,
    stickers: [String]
})

module.exports = mongoose.model('sticker', stickerSchema); 