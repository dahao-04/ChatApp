const express = require('express');
const router = express.Router();
const Message = require('../model/Message.js');
const { authToken } = require('../middleware/authMiddleware.js');

router.get("/log/:id", authToken, async(req, res) => {
    try {
        const partnerId = req.params.id;

        const messageSendList = await Message.find({ 
            from: req.user.id
        }).populate('from').populate('to');

        const messageReceiveList = await Message.find({
            to: req.user.id
        }).populate('from').populate('to')

        res.status(200).json({
            message: "Success",
            data: {
                sendList: messageSendList,
                receiveList: messageReceiveList
            }
        })
    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get("/:id", async(req, res) => {
    try {
        const message = await Message.findById(req.params.id).populate('from').populate('to');
        if(!message) {
            res.status(404).json({
                message: "Message not found."
            }) 
        }
        res.status(200).json({
            message: "Success",
            data: message
        })
    } catch (error) {
        
    }
})

router.post("/", async(req, res) => {
    try {
        const newMess = new Message(req.body);
        await newMess.save();
        res.status(201).json({
            message: "Message created.",
            data: newMess
        })
    } catch (error) {
        
    }
})

router.delete("/:id", async(req, res) => {
    try {
        const deleteRes = await Message.findByIdAndDelete(req.params.id);
        if(!deleteRes) {
            res.status(404).json({
                message: "Message not found."
            })
        }
        res.status(200).json({
            message: "Message deleted.",
            data: deleteRes
        })
    } catch (error) {
        
    }
})

module.exports = router;