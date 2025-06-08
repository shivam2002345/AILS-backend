const express = require('express');
const filestack = require('filestack-js');
const multer = require('multer');
const { Pool } = require('pg');
const router = express.Router();

// Filestack configuration
const client = filestack.init("A6fMJ1P8QVCrSDiLUNnvwz");

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.post('/upload-poc', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { course_id } = req.body;
    if (!course_id) {
      return res.status(400).json({ message: 'Course ID is required.' });
    }

    // Upload file to Filestack
    const result = await client.upload(req.file.buffer);
    console.log('Filestack response:', result); // Log the result to check if the URL is present

    if (result && result.url) {
      // Update the database with the URL
      const clientDb = await pool.connect();
      try {
        const query = 'UPDATE courses SET poc_url = $1 WHERE course_id = $2';
        await clientDb.query(query, [result.url, course_id]);
        res.status(200).json({ message: 'POC uploaded and URL saved.', url: result.url });
      } finally {
        clientDb.release();
      }
    } else {
      throw new Error('File upload failed: No URL returned.');
    }
  } catch (error) {
    console.error('Error uploading POC:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
});

module.exports = router;
