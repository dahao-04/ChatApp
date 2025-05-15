const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const Sticker = require('../model/Sticker');

router.get("/", async (req, res, next) => {
    const stickerSetList = await Sticker.find();
    if(!stickerSetList) return next(new AppError("Can not find sticker.", 404));
    res.status(200).json({
        success: true,
        message: "Success.",
        data: stickerSetList
    })
})

module.exports = router;