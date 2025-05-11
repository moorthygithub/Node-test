// server.js
require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // for Render.com
});

// POST route to insert data into PROFOLIOS
app.post("/api/profolio", async (req, res) => {
  const { Firstname, Lastname, Email, Phone, Description } = req.body;

  try {
    const query = `
      INSERT INTO PROFOLIOS (Firstname, Lastname, Email, Phone, Description)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [Firstname, Lastname, Email, Phone, Description];

    await pool.query(query, values);
    res.status(200).json({ message: "✅ Data inserted successfully!" });
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});
