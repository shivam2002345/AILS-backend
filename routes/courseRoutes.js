const express = require('express');
const { body } = require('express-validator');
const { uploadCourseFiles, handleUploadErrors } = require('../middlewares/upload');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.post(
  '/',
  uploadCourseFiles,
  handleUploadErrors,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('price').isNumeric().withMessage('Price must be numeric'),
    body('course_type').notEmpty().withMessage('Course type is required')
  ],
  createCourse
);

router.put(
  '/:id',
  uploadCourseFiles,
  handleUploadErrors,
  updateCourse
);

router.delete('/:id', deleteCourse);

module.exports = router;