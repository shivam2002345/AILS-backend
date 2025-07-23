const pool = require('../db');

const Course = {
  getAllCourses: async () => {
    const { rows } = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    return rows;
  },

  getCourseById: async (id) => {
    const { rows } = await pool.query('SELECT * FROM courses WHERE course_id = $1', [id]);
    return rows[0];
  },

  createCourse: async (courseData) => {
    const { title, description, price_dollar, price_inr, image_url, course_type, poc_url, category } = courseData;
  
    try {
  const { rows } = await pool.query(
  `INSERT INTO courses (title, description, price_dollar, price_inr, image_url, course_type, poc_url, category)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
  [title, description, price_dollar, price_inr, image_url, course_type, poc_url, category]
);
      return rows[0];
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  },
  
  updateCourse: async (id, courseData) => {
    const { title, description, image_url,price_dollar, price_inr, course_type, poc_url, category } = courseData;
const { rows } = await pool.query(
  `UPDATE courses SET title = $1, description = $2, price_dollar = $3, price_inr=$4, image_url = $5, course_type = $6, poc_url = $7, category = $8
   WHERE course_id = $9 RETURNING *`,
  [title, description, price_dollar, price_inr, image_url, course_type, poc_url, category, id]
);
    return rows[0];
  },

  deleteCourse: async (id) => {
    await pool.query('DELETE FROM courses WHERE course_id = $1', [id]);
  },
};

module.exports = Course;
