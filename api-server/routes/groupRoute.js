const express = require('express');
const router = express.Router();
const Group = require('../model/Group');

router.get("/", async(req, res) => {
    try {
        const groupList = await Group.find();
        res.status(200).json({
            message: "Success",
            data: groupList
        }) 
    } catch (error) {
        
    }
})

router.get("/user/:id", async(req, res) => {
    try {
        const groups = await Group.find({members_id: req.params.id});
        if(!groups) {
            res.status(404).json({
                message: "No group not found."
            }) 
        }
        res.status(200).json({
            message: "Success",
            data: groups
        })
    } catch (error) {
        
    }
})

router.get("/:id", async(req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if(!group) {
            res.status(404).json({
                message: "Group not found."
            }) 
        }
        res.status(200).json({
            message: "Success",
            data: group
        })
    } catch (error) {
        
    }
})

router.post("/", async(req, res) => {
    try {
        const newGroup = new Group(req.body);
        await newGroup.save();
        res.status(201).json({
            message: "Group created.",
            data: newGroup
        })
    } catch (error) {
        
    }
})

router.put("/:id", async(req, res) => {
    try {
        const updateGroup = {};
        const allowUpdate = ["group_name", "host_id", "members_id", "lastMessageSeq"];
        for(let key of allowUpdate) {
            if(req.body[key]!== undefined) {
                updateGroup[key] = req.body[key];
            }
        }

        const updateRes = await Group.findByIdAndUpdate(req.params.id, updateGroup, {new: true});
        if(!updateRes) {
            res.status(404).json({
                message: "Group not found."
            })
        }
        res.status(200).json({
            message: "Group updated.",
            data: updateRes
        })
    } catch (error) {
        
    }
})

router.delete("/:id", async(req, res) => {
    try {
        const deleteRes = await Group.findByIdAndDelete(req.params.id);
        if(!deleteRes) {
            res.status(404).json({
                message: "Group not found."
            })
        }
        res.status(200).json({
            message: "Group deleted.",
            data: deleteRes
        })
    } catch (error) {
        
    }
})

module.exports = router;