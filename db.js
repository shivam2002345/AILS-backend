const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
 
});

// Test the connection
pool.connect()
  .then(() => console.log("✅ DB connected successfully!"))
  .catch((err) => console.error("❌ DB connection error:", err.stack));

module.exports = pool;
