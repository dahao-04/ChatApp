const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError.js');
const Message = require('../model/Message.js');
const { authToken } = require('../middleware/authMiddleware.js');

router.get("/log/:id", authToken, async(req, res, next) => {
    try {
        const partnerId = req.params.id;
        if(!partnerId) return next( new AppError("partnerId is required.", 400));
        const messageSendList = await Message.find({ 
            from: req.user.id
        }).populate('from').populate('to');

        const messageReceiveList = await Message.find({
            to: req.user.id
        }).populate('from').populate('to')

        res.status(200).json({
            success: true,
            message: "Success",
            data: {
                sendList: messageSendList,
                receiveList: messageReceiveList
            }
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

router.get("/:id", async(req, res, next) => {
    try {
        const message = await Message.findById(req.params.id).populate('from').populate('to');
        if(!message) return next( new AppError("No message was found.", 404));
        res.status(200).json({
            success: true,
            message: "Success",
            data: message
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

router.post("/", async(req, res, next) => {
    try {
        //Sửa lại tạo mess cụ thể để làm xác định lỗi
        const newMess = new Message(req.body);
        if(!newMess) return next(new AppError("Required data.", 400));
        await newMess.save();
        res.status(201).json({
            success: true,
            message: "Message created.",
            data: newMess
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

router.delete("/:id", async(req, res, next) => {
    try {
        const deleteRes = await Message.findByIdAndDelete(req.params.id);
        if(!deleteRes) return next( new AppError("Message not found.", 404));
        res.status(200).json({
            success: true,
            message: "Message deleted.",
            data: deleteRes
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

module.exports = router;