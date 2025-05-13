const express = require('express');
const router = express.Router();
const { authToken, checkRoles } = require('../middleware/authMiddleware');
const AppError = require('../utils/AppError');
const Group = require('../model/Group');

router.get("/", authToken, checkRoles('admin'), async(req, res, next) => {
    try {
        const groupList = await Group.find();
        if(!groupList) return next(new AppError("No group was found.", 404));
        res.status(200).json({
            success: true,
            message: "Success",
            data: groupList
        }) 
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

router.get("/user/:id", authToken, checkRoles('admin', 'user'), async(req, res, next) => {
    try {
        const groups = await Group.find({members_id: req.params.id});
        if(!groups) return next(new AppError("No group was found.", 404));
        res.status(200).json({
            success: true,
            message: "Success",
            data: groups
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500))
    }
})

router.get("/:id", authToken, checkRoles('admin', 'user'), async(req, res, next) => {
    try {
        const group = await Group.findById(req.params.id).populate('members_id');
        if(!group) return next(new AppError("No group was found.", 404));
        res.status(200).json({
            success: true,
            message: "Success",
            data: group
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500))
    }
})

router.post("/", authToken, checkRoles('admin', 'user'), async(req, res, next) => {
    try {
        const newGroup = new Group(req.body);
        if(!newGroup) return next(new AppError("Required data.", 400));
        await newGroup.save();
        res.status(201).json({
            success: true,
            message: "Group created.",
            data: newGroup
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

router.post("/members/:id", authToken, checkRoles('admin', 'user'), async (req, res, next) => {
    try {
        const currentGroup = await Group.findById(req.params.id);
        if (!currentGroup) return next(new AppError("No group was found.", 404));

        if (req.body.members_id === undefined) return next(new AppError("Members id is required.", 400));

        const newMembers = Array.isArray(req.body.members_id)
            ? req.body.members_id
            : [req.body.members_id];

        const mergedMembers = [...new Set([...currentGroup.members_id, ...newMembers])];

        currentGroup.members_id = mergedMembers;
        const updateRes = await currentGroup.save();

        res.status(200).json({
            success: true,
            message: "Members added to group.",
            data: updateRes
        });
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
});

router.put("/:id", authToken, checkRoles('admin', 'user'), async (req, res, next) => {
    try {
        const { group_name, host_id, avatar_url } = req.body;
        const updateGroup = {};

        if (group_name) updateGroup.group_name = group_name;
        if (host_id) updateGroup.host_id = host_id;
        if (avatar_url) updateGroup.avatar_url = avatar_url;

        const updateRes = await Group.findByIdAndUpdate(
            req.params.id, 
            {$set: updateGroup}, 
            { new: true }
        );

        if (!updateRes) return next(new AppError("No group was found.", 404));

        res.status(200).json({
            success: true,
            message: "Group info updated.",
            data: updateRes
        });
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
});

router.delete("/members/:id", authToken, checkRoles('admin', 'user'), async (req, res, next) => {
    try {
        const currentGroup = await Group.findById(req.params.id);
        if (!currentGroup) return next(new AppError("Group not found.", 404));

        if (req.body.members_id === undefined) return next(new AppError("members_id is required.", 400));
        if (req.body.members_id.includes(currentGroup.host_id)) return next(new AppError("You are host.", 400));

        const membersToRemove = Array.isArray(req.body.members_id)
            ? req.body.members_id
            : [req.body.members_id];

        const updatedMembers = currentGroup.members_id.filter(
            (memberId) => !membersToRemove.includes(memberId.toString())
        );

        currentGroup.members_id = updatedMembers;
        const updateRes = await currentGroup.save();

        res.status(200).json({
            success: true,
            message: "Members removed from group.",
            data: updateRes
        });
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
});

router.delete("/:id", authToken, checkRoles('admin', 'user'), async(req, res, next) => {
    try {
        const deleteRes = await Group.findByIdAndDelete(req.params.id);
        if(!deleteRes) return next( new AppError("Group not found.", 404));
        res.status(200).json({
            success: true,
            message: "Group deleted.",
            data: deleteRes
        })
    } catch (error) {
        return next(new AppError("External Server Error.", 500));
    }
})

module.exports = router;