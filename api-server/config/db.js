const mongoose = require ('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const DB_URL = process.env.DB_URL;

const db = () => mongoose.connect(DB_URL)
        .then(() => console.log("Connected to mongo database..."))
        .catch((err) => console.log("Failed to connect database..."));

module.exports = db;