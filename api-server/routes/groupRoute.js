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
        const group = await Group.findById(req.params.id).populate('members_id');
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

router.post("/members/:id", async (req, res) => {
    try {
        const currentGroup = await Group.findById(req.params.id);
        if (!currentGroup) {
            return res.status(404).json({ message: "Group not found." });
        }

        if (req.body.members_id === undefined) {
            return res.status(400).json({ message: "members_id is required." });
        }

        const newMembers = Array.isArray(req.body.members_id)
            ? req.body.members_id
            : [req.body.members_id];

        const mergedMembers = [...new Set([...currentGroup.members_id, ...newMembers])];

        currentGroup.members_id = mergedMembers;
        const updateRes = await currentGroup.save();

        res.status(200).json({
            message: "Members added to group.",
            data: updateRes
        });
    } catch (error) {
        console.error("Add member error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updateGroup = {};
        const allowUpdate = ["group_name", "host_id", "lastMessageSeq"];

        for (let key of allowUpdate) {
            if (req.body[key] !== undefined) {
                updateGroup[key] = req.body[key];
            }
        }

        const updateRes = await Group.findByIdAndUpdate(req.params.id, updateGroup, { new: true });

        if (!updateRes) {
            return res.status(404).json({ message: "Group not found." });
        }

        res.status(200).json({
            message: "Group info updated.",
            data: updateRes
        });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

router.delete("/members/:id", async (req, res) => {
    try {
        const currentGroup = await Group.findById(req.params.id);
        if (!currentGroup) {
            return res.status(404).json({ message: "Group not found." });
        }

        if (req.body.members_id === undefined) {
            return res.status(400).json({ message: "members_id is required." });
        }

        const membersToRemove = Array.isArray(req.body.members_id)
            ? req.body.members_id
            : [req.body.members_id];

        const updatedMembers = currentGroup.members_id.filter(
            (memberId) => !membersToRemove.includes(memberId.toString())
        );

        currentGroup.members_id = updatedMembers;
        const updateRes = await currentGroup.save();

        res.status(200).json({
            message: "Members removed from group.",
            data: updateRes
        });
    } catch (error) {
        console.error("Remove member error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


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