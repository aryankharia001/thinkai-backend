const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure Public/Images exists
const uploadDir = path.join(__dirname, '..', 'Public', 'Images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

module.exports = upload;
