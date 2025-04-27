const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadImage');

// API upload
router.post('/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = `/uploads/avatars/${req.file.filename}`; // URL file trên server
  return res.status(200).json({ avatarUrl: filePath });
});

module.exports = router;
