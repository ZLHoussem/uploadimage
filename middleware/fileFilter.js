// middleware/fileFilter.js
const path = require('path');
const { ALLOWED_TYPES } = require('../config/config');

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  console.log(`Uploading file - MIME type: ${mimeType}, Extension: ${ext}, Original name: ${file.originalname}`);

  if (ALLOWED_TYPES[mimeType]?.includes(ext)) {
    return cb(null, true);
  } else {
    console.log(`File rejected - MIME type: ${mimeType}, Extension: ${ext}`);
    cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
  }
};

module.exports = fileFilter;