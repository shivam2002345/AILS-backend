const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.updateCode = async (req, res) => {
  const { adminId, newCodes } = req.body;

  // Validate input
  if (!adminId || !newCodes || !Array.isArray(newCodes) || newCodes.length === 0) {
    return res.status(400).json({ message: "Invalid request. 'adminId' and 'newCodes' are required." });
  }

  try {
    console.log(`Received request to update codes for adminId: ${adminId} with newCodes: ${newCodes}`);

    // Check if adminId exists in the admins table
    const adminCheckQuery = 'SELECT * FROM admins WHERE id = $1';
    const adminCheckValues = [adminId];
    const adminResult = await pool.query(adminCheckQuery, adminCheckValues);

    if (adminResult.rows.length === 0) {
      return res.status(404).json({ message: `Admin with id ${adminId} does not exist.` });
    }

    // Hash the new codes
    const hashedCodes = await Promise.all(
      newCodes.map(async (code) => bcrypt.hash(code.trim(), 10)) // Hash each code individually
    );

    // Check if reset codes exist for this admin
    const checkQuery = 'SELECT * FROM admin_reset_codes WHERE admin_id = $1';
    const checkValues = [adminId];

    const existingCodeResult = await pool.query(checkQuery, checkValues);

    if (existingCodeResult.rows.length > 0) {
      // If codes already exist for the admin, update them
      const updateQuery = 'UPDATE admin_reset_codes SET reset_code = $1, is_used = false, created_at = CURRENT_TIMESTAMP WHERE admin_id = $2';
      await pool.query(updateQuery, [hashedCodes.join(','), adminId]);

      return res.status(200).json({ message: 'Reset codes updated successfully' });
    } else {
      // If no code exists for the admin, insert a new record
      const insertQuery = 'INSERT INTO admin_reset_codes (admin_id, reset_code) VALUES ($1, $2)';
      await pool.query(insertQuery, [adminId, hashedCodes.join(',')]);

      return res.status(201).json({ message: 'Reset codes inserted successfully' });
    }
  } catch (error) {
    console.error('Error updating reset codes:', error);
    res.status(500).json({ message: 'Server error. Please check your request and try again.' });
  }
};
