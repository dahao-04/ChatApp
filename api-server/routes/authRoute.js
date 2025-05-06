const express = require('express');
const router = express.Router();

const User = require('../model/User');
const AppError = require('../utils/AppError');
const { generateToken, verifyPassword, hashPassword } = require('../middleware/authMiddleware');

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
        req.user = user;
        res.status(200).json({success: true, message: "Login success.", token: token});
})

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

router.post('/changePass/:id', async(req, res, next) => {
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