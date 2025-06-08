const express = require("express");
const router = express.Router();
const { getCourses } = require("../controllers/SearchController");

// Define the course search API route
router.get("/search/courses", getCourses);

module.exports = router;
