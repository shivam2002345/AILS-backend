const Course = require('../models/courseModel');
const { uploadToBlobStorage, deleteFromBlobStorage } = require('../utils/azureBlob');
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
  const { title, price, course_type, description, poc_url, category } = req.body;

  if (!title || !price || !course_type) {
    return res.status(400).json({ 
      success: false, 
      message: 'Title, price, and course type are required' 
    });
  }

  try {
    let imageUrl = null;
    let pocUrl = poc_url || null;

    // Upload image if exists
    if (req.files?.image?.[0]) {
      imageUrl = await uploadToBlobStorage(req.files.image[0], 'images');
    }

    // Upload POC if exists
    if (req.files?.poc?.[0]) {
      pocUrl = await uploadToBlobStorage(req.files.poc[0], 'pocs');
    }

    const courseData = { 
      title, 
      price, 
      course_type, 
      description, 
      poc_url: pocUrl, 
      category, 
      image_url: imageUrl 
    };

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
    // Get current course data
    const currentCourse = await Course.getCourseById(id);
    if (!currentCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const courseData = req.body;
    let imageUrl = currentCourse.image_url;
    let pocUrl = currentCourse.poc_url;

    // Update image if new one is uploaded
    if (req.files?.image?.[0]) {
      // Delete old image if exists
      if (currentCourse.image_url) {
        await deleteFromBlobStorage(currentCourse.image_url);
      }
      imageUrl = await uploadToBlobStorage(req.files.image[0], 'images');
      courseData.image_url = imageUrl;
    }

    // Update POC if new one is uploaded
    if (req.files?.poc?.[0]) {
      // Delete old POC if exists
      if (currentCourse.poc_url) {
        await deleteFromBlobStorage(currentCourse.poc_url);
      }
      pocUrl = await uploadToBlobStorage(req.files.poc[0], 'pocs');
      courseData.poc_url = pocUrl;
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
    // Get course data first to delete associated files
    const course = await Course.getCourseById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Delete associated files from blob storage
    if (course.image_url) {
      await deleteFromBlobStorage(course.image_url);
    }
    if (course.poc_url) {
      await deleteFromBlobStorage(course.poc_url);
    }

    // Delete from database
    await pool.query("DELETE FROM courses WHERE course_id = $1", [id]);

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