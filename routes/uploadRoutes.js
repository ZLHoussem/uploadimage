const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fileFilter = require('../middleware/fileFilter');
const { MAX_FILE_SIZE, UPLOAD_DIR, UPLOAD_DIRC } = require('../config/config');
const fs = require('fs'); // Add this missing import

// Storage configuration for regular uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for chouffeur uploads
const storagec = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRC);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer instance for regular uploads
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

// Multer instance for chouffeur uploads
const chouffeur = multer({
  storage: storagec,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

// Route for regular uploads (saves to UPLOAD_DIR)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route for chouffeur uploads (saves to UPLOAD_DIRC)
router.post('/chouffeur', chouffeur.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/chouffeur/${req.file.filename}`;
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to serve images
router.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOAD_DIR, filename);

  // Validate filename to prevent directory traversal
  if (filename.includes('..') || !filename.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Send the image file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  });
});

module.exports = router;