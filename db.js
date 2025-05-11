// db.js or server.js (Node.js + PostgreSQL Example)
require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json()); // Middleware to parse incoming JSON requests

// Set up PostgreSQL connection pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // SSL for Render.com or secure connections
});

// Route to insert data into PROFOLIOS table
app.post("/api/profolio", async (req, res) => {
  // Destructure the properties from the request body
  const { Firstname, Lastname, Email, Phone, Description } = req.body;

  try {
    // SQL query for inserting data into PROFOLIOS
    const query = `
      INSERT INTO PROFOLIOS (Firstname, Lastname, Email, Phone, Description)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [Firstname, Lastname, Email, Phone, Description]; // Values from req.body

    // Execute the query
    await pool.query(query, values);

    // Send a success response
    res.status(200).json({ message: "✅ Data inserted successfully!" });
  } catch (err) {
    // Handle error if the query fails
    console.error("❌ Error inserting data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("🚀 Server is running on port 3000ww");
});
