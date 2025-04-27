const express = require('express');
const router = express.Router();

const Conversation = require('../model/Conversation');
const Group = require('../model/Group');

const { authToken } = require('../middleware/authMiddleware');
const { generateConversationId } = require('../middleware/generateId');


router.get("/", async (req, res) => {
    try {
        const response = await Conversation.find();
        if(response.length === 0) return res.status(404).json({message: "Get conversation not found."});
        res.status(200).json({
            message: "Success.",
            data: response
        })
    } catch (error) {
        res.status(500).json({message: "External error."})
        console.log(error);
    }
})

router.get("/:id", authToken, async(req, res) => {
    try {
        const groupConversation = await Group.find({members_id: req.user.id}, {_id: 1});
        const groupIds = groupConversation.map(g => g._id);

        const response = await Conversation.find({
                                            $or:[
                                                {participant: req.user.id},
                                                {groupId: {$in: groupIds}}
                                            ]
                                            })
                                            .populate('participant', 'user_name avatar_url')
                                            .populate('groupId', 'group_name avatar_url')
                                            .sort({updateAt: -1});
        if(!response) return res.status(404).json({message: "Conversation not found."});
        res.status(200).json({
            message: "Success.",
            data: response
        })

    } catch (error) {
        res.status(500).json({message: "External error."})
        console.log(error);
    }
})

router.post("/", async (req, res) => {
    try {
       const newConversation = req.body;
       if(newConversation.type === 'direct') {
            const conversationId = generateConversationId(newConversation.participant);
            newConversation.conversationId = conversationId;
       }
       const conversation = new Conversation(newConversation);
       await conversation.save();
       res.status(200).json({message: "Conservation is created.", data: newConversation});
    } catch (error) {
        res.status(500).json({message: "External error."})
        console.log(error); 
    }
})

router.put("/", async (req, res) => {
    try {
        const filter = {};
        if (req.body.conversationId) filter.conversationId = req.body.conversationId;
        if (req.body.groupId) filter.groupId = req.body.groupId;

        const response = await Conversation.findOneAndUpdate(
            filter, 
            {
                participant: req.body.participant,
                lastMessage: {
                    from: req.body.lastMessage.from,
                    content: req.body.lastMessage.content,
                    createAt: req.body.lastMessage.createAt
                }
            }, 
            {new:true});
        if(!response) return res.status(404).json({message: "Can not update."})
        res.status(200).json({message: "Update success.", data: response});
    } catch (error) {
        res.status(500).json({message: "External error."})
        console.log(error); 
    }
})

router.delete("/:id", async(req, res) => {
    try {
        const response = await Conversation.findByIdAndDelete(req.params.id);
        if(!response) res.status(402).json({message: "Can not delete."})
        res.status(200).json({message: "Update success.", data: response});
    } catch (error) {
        res.status(500).json({message: "External error."})
        console.log(error); 
    }
})

module.exports = router;