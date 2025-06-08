const db = require('../db');

// Get admin by email
const getAdminByEmail = async (email) => {
    const query = 'SELECT * FROM admins WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
};

module.exports = { getAdminByEmail };
