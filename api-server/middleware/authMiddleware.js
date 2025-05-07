const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const AppError = require('../utils/AppError');
const RefreshToken = require('../model/RefreshToken');

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_REFRESH_KEY = process.env.SECRET_REFRESH_KEY;

const generateToken = (user) => {
    return jwt.sign({id: user._id, name: user.user_name, url: user.avatar_url, role: user.role}, SECRET_KEY, {expiresIn: "10m"});
}

const generateRefreshToken = (user) => {
    return jwt.sign({id: user._id, name: user.user_name, url: user.avatar_url, role: user.role}, SECRET_REFRESH_KEY, {expiresIn: "7d"});
}

const authToken = (req, res, next) => {
    const token = req.header("auth-token");
    if(!token) return next(new AppError("Do not have token.", 401, "NO_TOKEN"));
    jwt.verify(token, SECRET_KEY, async (err, user) => {
        if(err) {
            if(err.name === "TokenExpiredError") {
                return next(new AppError("Token expired.", 401, "TOKEN_EXPIRED"));
            }
            return next(new AppError("Invalid token.", 401, "INVALID_TOKEN"));
        }
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
    if(!refreshToken) return next(new AppError("Do not have refresh token.", 401, "NO_REFRESH_TOKEN"));
    const isExpired = await RefreshToken.findOne({token: refreshToken});
    if(isExpired) return next(new AppError("Refresh token has been revoked.", 401, "REVOKED_TOKEN"));
    jwt.verify(refreshToken, SECRET_REFRESH_KEY, async(err, user) => {
        if(err) return next(new AppError("Invalid refresh token.", 401, "INVALID_TOKEN"));
        const newUser = {
            _id: user.id,
            user_name: user.name,
            avatar_url: user.url,
            role: user.role
        }
        const newToken = generateToken(newUser);
        res.status(200).json({success: true, message: "Login success.", token: newToken});
    })
}

const checkRoles = (...roles) => {
    return (req, res, next) => {
        if(!req.user || !roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to access.", 403, "ACCESS_DENIDED."));
        }
        next();
    }
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

module.exports = { 
    authToken, 
    generateToken, 
    createRefreshToken, 
    generateRefreshToken, 
    verifyRefreshToken, 
    hashPassword, 
    verifyPassword,
    checkRoles
};
