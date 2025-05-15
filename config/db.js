// const { Pool } = require("pg");

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// module.exports = pool;
// db.js (CommonJS version, using require)
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});

// Check DB connection and list tables (wrapped in async function)
(async () => {
  try {
    const client = await pool.connect();
    const dbName = await client.query(`SELECT current_database();`);
    console.log("✅ Connected to database:", dbName.rows[0].current_database);

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);
    console.log("📋 Tables:");
    result.rows.forEach((row) => console.log(`- ${row.table_name}`));
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err);
  }
})();

module.exports = pool;
