const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError.js');
const paginateQuery = require('../utils/paginationQuery.js');
const Message = require('../model/Message.js');
const { authToken, checkRoles } = require('../middleware/authMiddleware.js');
const Group = require('../model/Group.js');

router.get("/log/:id", authToken, checkRoles('admin', 'user'), async (req, res, next) => {
    try {
        const userId = req.user.id;
        const partnerId = req.params.id;
        const type = req.query.type;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!partnerId) return next(new AppError("partnerId is required.", 400));

        let messageSendListPag;
        let messageReceiveListPag;

        // Tin nhắn gửi từ user -> partner
        const messageSendQuery = Message.find({
            from: userId,
            type: type
        }).populate('from').populate('to');
        messageSendListPag = await paginateQuery(messageSendQuery, { page, limit });

        if(type === 'direct') {
            // Tin nhắn nhận từ partner -> user
            const messageReceiveQuery = Message.find({
                to: userId
            }).populate('from').populate('to');
            messageReceiveListPag = await paginateQuery(messageReceiveQuery, { page, limit });
        } 

        if(type === 'group') {
            // Tin nhắn nhóm (nếu có)
            const userGroups = await Group.find({ members_id: userId }).select('_id');
            const groupIds = userGroups.map(g => g._id);

            const groupMessageQuery = Message.find({
                groupId: { $in: groupIds },
                type: 'group'
            }).populate('from').populate('groupId');
            messageReceiveListPag = await paginateQuery(groupMessageQuery, { page, limit });
        }


        res.status(200).json({
            success: true,
            message: "Success",
            data: {
                sendList: messageSendListPag.data,
                receiveList: messageReceiveListPag.data
            },
            pagination: {
                sendList: messageSendListPag.pagination,
                receiveList: messageReceiveListPag.pagination
            }
        });

    } catch (error) {
        console.error(error);
        return next(new AppError("External Server Error.", 500));
    }
});

router.get("/:id", authToken, checkRoles('admin', 'user'), async(req, res, next) => {
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

router.post("/", authToken, checkRoles('admin', 'user'), async(req, res, next) => {
    try {
        //Sửa lại tạo mess cụ thể để làm xác định lỗi
        const newMess = new Message(req.body);
        if(!newMess) return next(new AppError("Required data.", 400));
        const returnMess = await newMess.save();
        res.status(201).json({
            success: true,
            message: "Message created.",
            data: returnMess
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

router.delete("/:id", authToken, checkRoles('admin', 'user'), async(req, res, next) => {
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