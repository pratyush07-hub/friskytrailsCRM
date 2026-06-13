const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'crm_attachments',
    resource_type: 'auto',
    public_id: (req, file) => {
      // Extract original name without the extension
      const originalName = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;
      // Sanitize special characters to underscores to avoid invalid URL characters
      const sanitized = originalName.replace(/[^a-zA-Z0-9-_]/g, '_');
      // Generate a short 6-character random suffix to avoid file collisions
      const uniqueSuffix = Math.random().toString(36).substring(2, 8);
      return `${sanitized}_${uniqueSuffix}`;
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'webp'];
    const dotIndex = file.originalname.lastIndexOf('.');
    const ext = dotIndex !== -1 ? file.originalname.substring(dotIndex + 1).toLowerCase() : '';
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File format .${ext || 'unknown'} is not allowed. Allowed formats: ${allowedExtensions.join(', ')}`), false);
    }
  }
});

module.exports = upload;

