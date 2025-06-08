const pool = require("../db");

// Fetch courses with optional search filter
const getCourses = async (searchTerm) => {
  try {
    let query = "SELECT * FROM courses";
    let values = [];

    if (searchTerm) {
      query += " WHERE LOWER(title) LIKE LOWER($1)";
      values.push(`%${searchTerm}%`);
    }

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

module.exports = { getCourses };
