const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure Public/Videos exists (temporary local storage before uploading to Cloudinary)
const uploadDir = path.join(__dirname, '..', 'Public', 'Videos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/mkv', 'video/avi', 'video/mov'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
