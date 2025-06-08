const pool = require("../db");

// Get unused reset codes for an admin
const getResetCodesByAdminId = async (adminId) => {
    const result = await pool.query(
        "SELECT * FROM admin_reset_codes WHERE admin_id = $1 AND is_used = FALSE",
        [adminId]
    );
    return result.rows;
};

// Mark a reset code as used
const markResetCodeAsUsed = async (codeId) => {
    await pool.query("UPDATE admin_reset_codes SET is_used = TRUE WHERE id = $1", [codeId]);
};

// Delete all reset codes for an admin
const deleteResetCodesByAdminId = async (adminId) => {
    await pool.query("DELETE FROM admin_reset_codes WHERE admin_id = $1", [adminId]);
};

// Insert new reset codes
const insertResetCode = async (adminId, hashedCode) => {
    await pool.query(
        "INSERT INTO admin_reset_codes (admin_id, reset_code) VALUES ($1, $2)",
        [adminId, hashedCode]
    );
};

module.exports = {
    getResetCodesByAdminId,
    markResetCodeAsUsed,
    deleteResetCodesByAdminId,
    insertResetCode,
};
