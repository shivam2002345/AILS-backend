const express = require('express');
const { body } = require('express-validator');
const {
  getAllWebinars,
  getWebinarById,
  createWebinar,
  updateWebinar,
  deleteWebinar,
} = require('../controllers/webinarController');
const { uploadWebinarFiles, handleUploadErrors } = require('../middlewares/upload');

const router = express.Router();

router.get('/', getAllWebinars);
router.get('/:id', getWebinarById);

router.post(
  '/',
  uploadWebinarFiles,
  handleUploadErrors,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('cost').isNumeric().withMessage('Cost must be numeric'),
    body('webinar_type').notEmpty().withMessage('Webinar type is required')
  ],
  createWebinar
);

router.put(
  '/:id',
  uploadWebinarFiles,
  handleUploadErrors,
  updateWebinar
);

router.delete('/:id', deleteWebinar);

module.exports = router;