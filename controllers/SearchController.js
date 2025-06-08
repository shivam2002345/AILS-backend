const courseModel = require("../models/SearchModel");

// Controller to get courses with optional search
const getCourses = async (req, res) => {
    try {
      const { name } = req.query;
      const courses = await courseModel.getCourses(name);
  
      if (courses.length === 0) {
        return res.status(404).json({ message: "No match found , connect with us to get customized one" });
      }
  
      res.status(200).json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

module.exports = { getCourses };
