const express = require('express');
const router = express.Router();

const User = require('../model/User');
const { generateToken } = require('../middleware/authMiddleware');

router.post('/login', async(req, res) => {
    const user = await User.findOne({user_email: req.body.user_email});
        if(!user) {
            return res.status(404).json({message: "User not found."});
        }
        if(user.user_password !== req.body.user_password) {
            return res.status(401).json({message: "Password is not match"});
        }
        const token = generateToken(user);
        req.user = user;
        res.status(200).json({message: "Login success.", token: token});
})

router.post('/signup', async(req, res) => {
    const newUser = new User({
        user_name: req.body.user_name,
        user_email: req.body.user_email,
        user_password: req.body.user_password
    });
    const exsiting = await User.findOne({user_email: newUser.user_email});
    if(exsiting) return res.status(400).json({message: "Email already exsited."})
    const savedUser = await newUser.save();
    if(!savedUser) return res.status(401).json({message: "Can not sign up."});
    const token = generateToken(savedUser);
    req.user = savedUser;
    res.status(200).json({message: "Sign up success.", token: token});

})

module.exports = router;