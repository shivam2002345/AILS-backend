const pool = require("../db");  // Ensure 'pool' is imported here

// Get admin by email
const getAdminByEmail = async (email) => {
    const result = await pool.query("SELECT id, email, password FROM admins WHERE email = $1", [email]);
    return result.rows[0]; // Return the first row, which should contain the admin data
};

// Get admin by ID
const getAdminById = async (id) => {
    const result = await pool.query("SELECT * FROM admins WHERE id = $1", [id]);
    return result.rows[0];
};
const getResetCodesByAdminId = async (adminId) => {
    const query = "SELECT reset_code, is_used FROM admin_reset_codes WHERE admin_id = $1";
    const result = await pool.query(query, [adminId]);
    return result.rows;  // Returns an array of reset codes and their usage status
};
// Update admin password
const updateAdminPassword = async (adminId, hashedPassword) => {
    const query = "UPDATE admins SET password = $1 WHERE id = $2";
    const values = [hashedPassword, adminId];
  
    try {
        const result = await pool.query(query, values);
        return result; // Result contains fields like rowCount or affectedRows
    } catch (error) {
        console.error("Error in updateAdminPassword:", error);
        throw error; // Let the calling function handle it
    }
};

module.exports = {
    getAdminByEmail,
    getAdminById,
    getResetCodesByAdminId ,  // Export the new function
    updateAdminPassword,
};
