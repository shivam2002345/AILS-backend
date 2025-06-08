const multer = require('multer');
const path = require('path');

// Use memory storage for Azure uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if ((file.fieldname === 'image' || file.fieldname === 'poc') && extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type or field name. Only ${allowedFileTypes} files are allowed in 'image' or 'poc' fields.`));
  }
};

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 2
  },
  fileFilter
});

// Separate handlers
const uploadCourseFiles = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'poc', maxCount: 1 }
]);

const uploadWebinarFiles = upload.fields([
  { name: 'image', maxCount: 1 }
]);

const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err) {
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
  uploadWebinarFiles, // 👈 now this exists!
  handleUploadErrors
};
