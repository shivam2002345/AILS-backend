const express = require("express");
const adminController = require("../controllers/adminController");
const authenticate = require("../middlewares/authenticate"); // Import the authentication middleware

const router = express.Router();

// Protect the profile routes with authentication
router.get("/profile", authenticate, adminController.getAdminProfile);
router.post("/update-profile", authenticate, adminController.resetPasswordProfile);

// Other unprotected routes
router.post("/reset-password", adminController.resetPassword);
// router.put("/update-codes", adminController.updateResetCodes);
router.post("/check-code", adminController.checkCode);

module.exports = router;
