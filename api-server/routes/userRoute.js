const express = require('express');
const router = express.Router();
const User = require('../model/User');
const AppError = require('../utils/AppError');
const { authToken } = require('../middleware/authMiddleware');

router.get("/", async(req, res, next) => {
    try {
        const userList = await User.find();
        if(!userList) return next(new AppError("No user was found.", 404));
        res.status(200).json({
            success: true,
            message: "Success",
            data: userList
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500))
    }
})

router.get("/email", async(req, res, next) => {
    try {
        const {user_email} = req.query;

        if(!user_email) return next(new AppError("User email is required.", 400));

        const user = await User.findOne({user_email: user_email});
        
        if(!user) return next(new AppError("User not found.", 404));
        res.status(200).json({
            success: true,
            message: "Success.",
            data: user
        })
    } catch (error) {
        return next(new AppError("External error.", 500));
    }
})

router.get("/:id", async(req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return next(new AppError("User not found.", 404));
        res.status(200).json({
            success: true,
            message: "Success",
            data: user
        })
    } catch (error) {
        return next(new AppError("External error.", 500));
    }
})

router.post("/", async(req, res, next) => {
    try {
        const { user_email, user_name, avatar_url, user_password } = req.body;
        if(!user_email || !user_name || !avatar_url || !user_password) return next(new AppError("Required data.", 400))
        const newUser = new User({
            user_email: user_email,
            user_name: user_name,
            avatar_url: avatar_url,
            user_password: user_password
        })
        const response = await newUser.save();
        if(!response) return next(new AppError("Can not create user.", 401));
        res.status(201).json({
            success: true,
            message: "User created.",
            data: newUser
        })
    } catch (error) {
        return next(new AppError("External error.", 500));
    }
})

router.put("/:id", authToken, async(req, res, next) => {
    try {
        const { user_name, avatar_url, user_password } = req.body;
        const updateFields = {};
        if (user_name) updateFields.user_name = user_name;
        if (avatar_url) updateFields.avatar_url = avatar_url;
        if (user_password) updateFields.user_password = user_password;
        
        const updateRes = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        );        
        if(!updateRes) return next(new AppError("User not found.", 404));
        res.status(200).json({
            success: true,
            message: "User updated.",
            data: updateRes
        })
    } catch (error) {
        return next(new AppError("External error.", 500));
    }
})

router.delete("/:id", async(req, res, next) => {
    try {
        const deleteRes = await User.findByIdAndDelete(req.params.id);
        if(!deleteRes) return next(new AppError("User not found.", 404));
        res.status(200).json({
            success: true,
            message: "User deleted.",
            data: deleteRes
        })
    } catch (error) {
        return next(new AppError("External error.", 500));
    }
})

module.exports = router;