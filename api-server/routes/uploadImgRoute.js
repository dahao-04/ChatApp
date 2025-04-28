const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const upload = require('../middleware/uploadImage');

// API upload
router.post('/avatar', upload.single('avatar'), (req, res, next) => {
  if (!req.file) return next( new AppError("No file to upload.", 400));
  const filePath = `/uploads/avatars/${req.file.filename}`;
  return res.status(200).json({ success: true, avatarUrl: filePath });
});

module.exports = router;
