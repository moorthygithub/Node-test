// server.js
require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// PostgreSQL connection pool setup using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // for Render.com SSL requirement
});

// Test database connection to ensure it's working
pool
  .connect()
  .then(() => {
    console.log("Successfully connected to the database.");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

// POST route to insert data into the PROFOLIOS table
app.post("/api/profolio", async (req, res) => {
  console.log("Received data:", req.body); // Log incoming data to console

  // Destructure data from request body
  const { Firstname, Lastname, Email, Phone, Description } = req.body;

  // Check if all required fields are provided
  if (!Firstname || !Lastname || !Email || !Phone || !Description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Prepare SQL query and values to insert into the database
  const query = `
    INSERT INTO PROFOLIOS (Firstname, Lastname, Email, Phone, Description)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [Firstname, Lastname, Email, Phone, Description];

  try {
    // Execute the query to insert the data into the database
    await pool.query(query, values);
    console.log("✅ Data inserted successfully!");
    res.status(200).json({ message: "✅ Data inserted successfully!" });
  } catch (err) {
    // If there's an error, log it and send an error response
    console.error("❌ Error inserting data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000; // Default to port 3000 if not set in environment
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
