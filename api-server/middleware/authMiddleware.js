const User = require('../model/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const generateToken = (user) => {
    return jwt.sign({id: user._id, name: user.user_name, url: user.avatar_url}, SECRET_KEY, {expiresIn: "1200h"});
}

const authToken = (req, res, next) => {
    const token = req.header("auth-token");
    if(!token) return res.status(401).json({message: "Token not found."});
    jwt.verify(token, SECRET_KEY, async (err, user) => {
        if(err) return res.status(403).json({message: "Can not authorize."});
        req.user = user;
        next();
    })
}

module.exports = { authToken, generateToken };
