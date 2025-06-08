const multer = require('multer');
const path = require('path');

// Use memory storage for Azure uploads
const storage = multer.memoryStorage();

// Create the base multer instance with configuration
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 2 // Max 2 files (image + poc)
  },
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if ((file.fieldname === 'image' || file.fieldname === 'poc') && extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error(`Invalid file type or field name. Only ${allowedFileTypes} files are allowed in 'image' or 'poc' fields.`));
    }
  }
});

// Create specific middleware instances
const uploadCourseFiles = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'poc', maxCount: 1 }
]);

// Error handling wrapper
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
  next();
};

module.exports = {
  upload,
  uploadCourseFiles,
  handleUploadErrors
};