const express = require('express');
const router = express.Router();

const User = require('../model/User');
const AppError = require('../utils/AppError');
const { authToken, generateToken, generateRefreshToken, createRefreshToken, verifyRefreshToken, verifyPassword, hashPassword } = require('../middleware/authMiddleware');
const RefreshToken = require('../model/RefreshToken');

router.post('/login', async(req, res, next) => {
    const user = await User.findOne({user_email: req.body.user_email});
        if(!user) {
            return next(new AppError('User not found.', 404));
        }

        const isMatch = await verifyPassword(req.body.user_password, user.user_password);
    if(!isMatch) {
            return next(new AppError('Password not match.', 401));
        }
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 7*24*60*60*1000
        });

        req.user = user;

        res.status(200).json({success: true, message: "Login success.", token: token});
})

router.post('/logout', authToken, async(req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return next(new AppError("Can not find refresh token.", 401));
        const isVerify = await verifyRefreshToken(refreshToken);
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict'
        })
        const saveToken = new RefreshToken ({
            token: refreshToken,
            userId: isVerify.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            createAt: new Date()
        })
        const response = await saveToken.save();
        if(true) res.status(200).json({message: "Success."})

    } catch (error) {
        return next(new AppError("Invalid refresh token.", 401));
    }
})

router.post('/refresh', createRefreshToken);

router.post('/signup', async(req, res, next) => {
    const { user_name, user_email, user_password } = req.body;
    if(!user_name||!user_email||!user_password)
        return next(new AppError("Required data.", 400));

    const exsiting = await User.findOne({user_email: user_email});
    if(exsiting) return next(new AppError("User already existed.", 409))

    const hashedPassword = await hashPassword(user_password);
    const newUser = new User({
        user_name,
        user_email,
        user_password: hashedPassword,
    });
    const savedUser = await newUser.save();
    if(!savedUser) return next(new AppError("Can not sign up.", 500));

    const token = generateToken(savedUser);
    req.user = savedUser;
    res.status(200).json({success: true, message: "Sign up success.", token: token});
})

router.post('/changePass/:id', authToken, async(req, res, next) => {
    const { current_password, new_password } = req.body;
    const userId = req.params.id;
    const checkPass = await User.findById(userId);
    if(!checkPass) return next( new AppError("User not found.", 404) );
    const isMatch = await verifyPassword( current_password, checkPass.user_password);

    if(isMatch) {
        const newHashPass = await hashPassword(new_password);
        const response = await User.findByIdAndUpdate(userId, {user_password: newHashPass});
        if(response) return res.status(200).json({success: true, message: "Password updated."})
    } else {
        return next( new AppError("Password not match.", 409) );
    }
})

module.exports = router;