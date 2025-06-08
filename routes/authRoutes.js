const express = require('express');
const { login } = require('../controllers/authController');
const router = express.Router();

// POST route for admin login
router.post('/login', login);

module.exports = router;
