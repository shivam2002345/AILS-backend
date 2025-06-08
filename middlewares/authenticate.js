const jwt = require("jsonwebtoken");
const adminModel = require("../models/adminModel");
require("dotenv").config();

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing." });
  }

  console.log("Token received:", token); // Log token to check the format

  try {
    const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Verify token and decode it
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET_KEY);

    // Await the result from getAdminById
    const admin = await adminModel.getAdminById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Invalid token. Authentication failed." });
    }

    req.user = admin; // Attach admin data to request
    next(); // Proceed to next middleware
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = authenticate;
