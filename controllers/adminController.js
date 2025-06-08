const bcrypt = require("bcryptjs");
const Joi = require("joi");
const adminModel = require("../models/adminModel");
const resetCodeModel = require("../models/resetCodeModel");
const adminResetCodeModel = require('../models/resetCodeModel');

// Schema for reset password validation
const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    reset_code: Joi.string().required(),
    new_password: Joi.string().min(8).required(),
});

// Schema for password validation
const passwordSchema = Joi.string().min(8).required().messages({
    "string.empty": "Password cannot be empty",
    "string.min": "Password must be at least 8 characters long",
});

const checkCode = async (req, res) => {
    const { code, adminId } = req.body;

    if (!code) {
        return res.status(400).json({ valid: false, message: "Reset code is required" });
    }

    if (!adminId) {
        return res.status(400).json({ valid: false, message: "Admin ID is required" });
    }

    try {
        // Fetch the reset codes for the provided adminId from the database
        const resetCodes = await resetCodeModel.getResetCodesByAdminId(adminId);

        if (resetCodes.length === 0) {
            console.log(`No reset codes found for admin ID: ${adminId}`);
            return res.status(400).json({ valid: false, message: "No reset codes found for this admin ID" });
        }

        // Log fetched reset codes for debugging
        console.log('Fetched reset codes:', resetCodes);

        // Extract individual reset codes from the string
        const resetCodeHashes = resetCodes[0].reset_code.split(',');

        // Log the individual hashes
        console.log('Individual reset code hashes:', resetCodeHashes);

        // Check if the provided code matches any of the stored hashes and is not used
        const validCode = await Promise.all(resetCodeHashes.map(async (resetCode) => {
            const match = await bcrypt.compare(code, resetCode);
            console.log(`Checking code: ${code} against reset_code: ${resetCode} => Match: ${match}`);
            return match;
        }));

        // If any valid code is found, return success
        if (validCode.includes(true)) {
            return res.status(200).json({ valid: true });
        } else {
            return res.status(400).json({ valid: false, message: "Invalid or used reset code" });
        }
    } catch (error) {
        console.error('Error validating reset code:', error);
        return res.status(500).json({ valid: false, message: "Internal server error" });
    }
};
// Reset Password (after verifying code)
const resetPassword = async (req, res) => {
    const { email, reset_code, new_password } = req.body;

    // Validate input using Joi schema
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const admin = await adminModel.getAdminByEmail(email);
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        // Verify reset code
        const resetCodes = await resetCodeModel.getResetCodesByAdminId(admin.id);
        const validCode = resetCodes.find((code) =>
            bcrypt.compareSync(reset_code, code.reset_code)
        );

        if (!validCode) {
            return res.status(400).json({ error: "Invalid reset code" });
        }

        // Hash new password and update in DB
        const hashedPassword = bcrypt.hashSync(new_password, 10);
        await adminModel.updateAdminPassword(admin.id, hashedPassword);
        await resetCodeModel.markResetCodeAsUsed(validCode.id);

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Reset Password for Authenticated Admin (without email and code, just password change)
const resetPasswordProfile = async (req, res) => {
    const { password } = req.body;

    // Validate password input
    const { error } = passwordSchema.validate(password);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Ensure the admin is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Admin is not authenticated" });
        }

        const adminId = req.user.id;

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Update the admin's password in the database
        const updateResult = await adminModel.updateAdminPassword(adminId, hashedPassword);

        // Add logging for debugging
        console.log("Password Update Result:", updateResult);

        // Refine the success condition
        if (updateResult && updateResult.rowCount > 0) {
            return res.status(200).json({ message: "Password reset successful" });
          } else {
            console.warn("Password update failed:", updateResult);
            return res.status(500).json({ message: "Failed to update password. Please try again." });
          }
    } catch (error) {
        console.error("Error in resetPasswordProfile:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// Get Admin Profile (fetch based on authenticated admin)
const getAdminProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Admin not authenticated" });
        }

        const adminId = req.user.id;

        // Fetch admin profile and reset codes concurrently
        const [admin, resetCodes] = await Promise.all([
            adminModel.getAdminById(adminId),
            adminResetCodeModel.getResetCodesByAdminId(adminId), // Function to get reset codes
        ]);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Combine the admin data with reset codes
        const responseData = {
            name: admin.name,
            email: admin.email,
            full_name: admin.full_name,
            phone_number: admin.phone_number,
            reset_codes: resetCodes ? resetCodes.map(code => code.reset_code) : [], // Handle missing reset codes
        };

        // Send the combined data as response
        res.status(200).json(responseData);

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


module.exports = {
    checkCode,
    resetPassword,
    resetPasswordProfile,
    getAdminProfile,
};
