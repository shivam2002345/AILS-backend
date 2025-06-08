// Backend/routes/CodeUpdateRoutes.js
const express = require('express');
const router = express.Router();
const { updateCode } = require('../controllers/CodeUpdateController');

// Route to update the reset code
router.put('/update-code', updateCode);

module.exports = router;
