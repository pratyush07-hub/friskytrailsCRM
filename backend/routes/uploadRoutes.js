const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

// POST /api/upload
// Endpoint for uploading a single file. The field name in form-data should be 'file'
router.post('/', (req, res) => {
  upload.single('file')(req, res, function(err) {
    if (err) {
      console.error('Multer/Cloudinary error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // req.file contains information about the uploaded file,
      // including the path (which is the Cloudinary secure URL when using multer-storage-cloudinary)
      res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl: req.file.path,
        fileData: req.file
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Server error during file upload', error: error.message });
    }
  });
});

module.exports = router;
