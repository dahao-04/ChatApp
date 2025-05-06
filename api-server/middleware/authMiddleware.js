const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const AppError = require('../utils/AppError');
const RefreshToken = require('../model/RefreshToken');

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_REFRESH_KEY = process.env.SECRET_REFRESH_KEY;

const generateToken = (user) => {
    return jwt.sign({id: user._id, name: user.user_name, url: user.avatar_url}, SECRET_KEY, {expiresIn: "15m"});
}

const generateRefreshToken = (user) => {
    return jwt.sign({id: user._id, name: user.user_name, url: user.avatar_url}, SECRET_REFRESH_KEY, {expiresIn: "7d"});
}

const authToken = (req, res, next) => {
    const token = req.header("auth-token");
    if(!token) return next(new AppError("Do not have token.", 401));
    jwt.verify(token, SECRET_KEY, async (err, user) => {
        if(err) return next(new AppError("Can not authorized.", 401));
        req.user = user;
        next();
    })
}

const verifyRefreshToken = async (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET_REFRESH_KEY, (err, user) => {
            if(err) return reject(err);
            return resolve(user);
        })
    })
}

const createRefreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return next(new AppError("Do not have refresh token.", 401));
    const isExpired = await RefreshToken.findOne({token: refreshToken});
    if(isExpired) return next(new AppError("Refresh token has been revoked.", 401));
    jwt.verify(refreshToken, SECRET_REFRESH_KEY, async(err, user) => {
        if(err) return next(new AppError("Can not authorized.", 401));
        const newToken = generateToken(user);
        res.status(200).json({success: true, message: "Login success.", token: newToken});
    })
}

const hashPassword = async (password) => {
    const salt = 10;
    const hashedPass = await bcrypt.hash(password, salt);
    return hashedPass;
}

const verifyPassword = async (plainPass, hashedPass) => {
    const isMatch = await bcrypt.compare(plainPass, hashedPass);
    return isMatch;
}

module.exports = { authToken, generateToken, createRefreshToken, generateRefreshToken, verifyRefreshToken, hashPassword, verifyPassword };
