// const { Pool } = require("pg");

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// module.exports = pool;
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase
});
const result = await pool.query(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
);
pool
  .connect()
  .then(() => console.log("Available tables in DB:", result.rows))
  .then(() => console.log("✅ PostgreSQL connected successfully!"))
  .catch((err) => console.error("❌ PostgreSQL connection failed:", err));

module.exports = pool;
