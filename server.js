require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});
pool;
// .connect()
// .then(() => {
//   console.log("Successfully connected to the database.");
// })
// .catch((err) => {
//   console.error("Error connecting to the database:", err);
// });

app.post("/api/profolio", async (req, res) => {
  console.log("Received data:", req.body);
  const { Firstname, Lastname, Email, Phone, Description } = req.body;
  if (!Firstname || !Lastname || !Email || !Phone || !Description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = `
    INSERT INTO PROFOLIOS (Firstname, Lastname, Email, Phone, Description)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [Firstname, Lastname, Email, Phone, Description];
  try {
    await pool.query(query, values);
    console.log("✅ Data inserted successfully!");
    res.status(200).json({ message: "✅ Data inserted successfully!" });
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/profolios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM PROFOLIOS");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/api/profolio-update", async (req, res) => {
  try {
    const { Firstname, Lastname, Email, Phone, Description } = req.body;
    if (!Firstname || !Lastname || !Email || !Phone || !Description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const query = `
      UPDATE PROFOLIOS
      SET Firstname = $1, Lastname = $2, Email = $3, Phone = $4, Description = $5
      WHERE Email = $3
    `;
    const values = [Firstname, Lastname, Email, Phone, Description];
    const result = await pool.query(query, values);
        if (result.rowCount === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.status(200).json({ message: "✅ Profile updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating data:", err);
    res.status(500).json({ error: "Server error" });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
