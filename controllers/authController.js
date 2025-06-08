const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const adminModel = require('../models/adminModel');

// Rate limiter to prevent brute-force attacks (without Redis)
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 requests per windowMs
    message: 'Too many requests from this IP, please try again after an hour.',
});

// Schema for login validation
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

// Login API
const login = async (req, res) => {
    const { email, password } = req.body;

    // Validate request body using Joi schema
    const { error } = loginSchema.validate({ email, password });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const admin = await adminModel.getAdminByEmail(email);
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        // Compare the hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        // Send the response with the token, adminId, and success message
        res.json({
            message: "Login successful",
            token,
            adminId: admin.id,  // Include adminId in the response
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { login };