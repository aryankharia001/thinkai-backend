const cloudinary = require('../Utils/cloudinary');
const fs = require('fs');
const path = require('path');

exports.uploadImage = async (req, res) => {
  try {
    const filePath = req.file.path;

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'uploads'
    });

    // Delete local file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Image uploaded',
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};
