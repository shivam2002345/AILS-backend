const Course = require('../models/courseModel');
const cloudinary = require('../utils/azureBlob');
const pool = require('../db');
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.getCourseById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  const { title, price, course_type, description, poc_url, category, image_url } = req.body;

  if (!title || !price || !course_type) {
    return res.status(400).json({ 
      success: false, 
      message: 'Title, price, and course type are required' 
    });
  }

  try {
    let uploadedImageUrl = image_url || null;

    if (req.file) {
      // Upload image to Cloudinary if a file is uploaded
      const result = await cloudinary.uploader.upload(req.file.path);
      uploadedImageUrl = result.secure_url; // Cloudinary URL
    }

    // Prepare course data
    const courseData = { title, price, course_type, description, poc_url, category, image_url: uploadedImageUrl };

    const course = await Course.createCourse(courseData);

    res.status(201).json({ 
      success: true, 
      message: 'Course created successfully', 
      data: course 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating course', 
      error: error.message 
    });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const courseData = req.body;

    if (req.file) {
      // Upload updated image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      courseData.image_url = result.secure_url; // Cloudinary URL
    }

    const updatedCourse = await Course.updateCourse(id, courseData);
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM courses WHERE course_id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message,
    });
  }
};



const Course = require('../models/courseModel');
const { uploadFileToBlob } = require('../utils/azureBlob');
const pool = require('../db');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.getCourseById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  const { title, price, course_type, description, category } = req.body;
  console.log(req.files , 'files')
  if (!title || !price || !course_type) {
    return res.status(400).json({ 
      success: false, 
      message: 'Title, price, and course type are required' 
    });
  }
  console.log(req.files , 'files')
  try {
    let uploadedImageUrl = null;
    let uploadedPocUrl = null;
    console.log(req.files , 'files')
    // Handling file uploads for image and poc (PDF)
    if (req.files) {
      if (req.files.image) {
        uploadedImageUrl = await uploadFileToBlob(req.files.image[0].path, 'ailsimages');  // Uploading to image container
      }
      if (req.files.poc) {
        uploadedPocUrl = await uploadFileToBlob(req.files.poc[0].path, 'coursepdf');  // Uploading to PDF container
      }
    }
  console.log(req.files , 'files')
    // Prepare course data
    const courseData = { 
      title, 
      price, 
      course_type, 
      description, 
      category, 
      image_url: uploadedImageUrl,  // URL of uploaded image
      poc_url: uploadedPocUrl      // URL of uploaded PDF
    };

    // Save course to the database
    const course = await Course.create(courseData);

    res.status(201).json({ 
      success: true, 
      message: 'Course created successfully', 
      data: course 
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating course', 
      error: error.message 
    });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const courseData = req.body;

    if (req.file) {
      // Upload updated image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      courseData.image_url = result.secure_url; // Cloudinary URL
    }

    const updatedCourse = await Course.updateCourse(id, courseData);
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM courses WHERE course_id = $1 RETURNING *", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message,
    });
  }
};