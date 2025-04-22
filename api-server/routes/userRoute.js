const express = require('express');
const router = express.Router();
const User = require('../model/User');
const { authToken } = require('../middleware/authMiddleware');

router.get("/", async(req, res) => {
    try {
        const userList = await User.find();
        res.status(200).json({
            message: "Success",
            data: userList
        })
    } catch (error) {
        
    }
})

router.get("/email", async(req, res) => {
    try {
        const {user_email} = req.query;

        const user = await User.findOne({user_email: user_email});
        
        if(!user) return res.status(404).json({message: "User not found."});
        res.status(200).json({
            message: "Success.",
            data: user
        })
    } catch (error) {
        return res.status(500).json({message: "External error."})
    }
})

router.get("/:id", async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) {
            res.status(404).json({
                message: "User not found."
            }) 
        }
        res.status(200).json({
            message: "Success",
            data: user
        })
    } catch (error) {
        
    }
})

router.post("/", async(req, res) => {
    try {
        const newUser = new User({
            user_email: req.body.user_email,
            user_name: req.body.user_name,
            user_password: req.body.user_password
        })
        const response = await newUser.save();
        if(!response) return res.status(401).json({message: "Can not create user."});
        res.status(201).json({
            message: "User created.",
            data: newUser
        })
    } catch (error) {
        
    }
})

router.put("/:id", authToken, async(req, res) => {
    try {
        const updateUser = new User({
            user_name: req.body.user_name
        })
        const updateRes = await User.findByIdAndUpdate(req.params.id, updateUser, {new: true});
        if(!updateRes) {
            res.status(404).json({
                message: "User not found."
            })
        }
        res.status(200).json({
            message: "User updated.",
            data: updateRes
        })
    } catch (error) {
        
    }
})

router.delete("/:id", async(req, res) => {
    try {
        const deleteRes = await User.findByIdAndDelete(req.params.id);
        if(!deleteRes) {
            res.status(404).json({
                message: "User not found."
            })
        }
        res.status(200).json({
            message: "User deleted.",
            data: deleteRes
        })
    } catch (error) {
        
    }
})

module.exports = router;