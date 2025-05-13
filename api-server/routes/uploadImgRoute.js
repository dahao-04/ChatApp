const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const {upload, uploadImage} = require('../middleware/uploadImage');

// API upload
router.post('/avatar', upload.single('avatar'), (req, res, next) => {
  if (!req.file) return next( new AppError("No file to upload.", 400));
  const filePath = `/uploads/avatars/${req.file.filename}`;
  return res.status(200).json({ success: true, avatarUrl: filePath });
});

router.post('/image', uploadImage.single('image'), (req, res, next) => {
  if (!req.file) return next( new AppError("No file to upload.", 400));
  const filePath = `/uploads/messages/${req.file.filename}`;
  return res.status(200).json({ success: true, imageUrl: filePath });
})

module.exports = router;
