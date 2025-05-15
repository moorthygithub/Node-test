require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();
app.use(cors());
app.use(express.json());
// PostgreSQL pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
app.post("/api/profolio", async (req, res) => {
  console.log("Received data:", req.body);
  const { Firstname, Lastname, Email, Phone, Description } = req.body;
  if (!Firstname || !Lastname || !Email || !Phone || !Description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = `
    INSERT INTO profolios ("Firstname", "Lastname", "Email", "Phone", "Description")
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [Firstname, Lastname, Email, Phone, Description];
  try {
    await pool.query(query, values);
    const mailOptions = {
      from: `"Portfolio App" <${process.env.EMAIL_USER}>`,
      to: "moorthy.chandiran21@gmail.com",
      subject: "New Portfolio Submission",
      html: `
        <h2>New Portfolio Submitted</h2>
        <p><strong>Firstname:</strong> ${Firstname}</p>
        <p><strong>Lastname:</strong> ${Lastname}</p>
        <p><strong>Email:</strong> ${Email}</p>
        <p><strong>Phone:</strong> ${Phone}</p>
        <p><strong>Description:</strong><br>${Description}</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log("✅ Data inserted successfully!");
    res.status(200).json({ message: "✅ Data inserted successfully!" });
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/profolios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profolios");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/api/profolio-update", async (req, res) => {
  try {
    const { id, Firstname, Lastname, Email, Phone, Description } = req.body;
    if (!id || !Firstname || !Lastname || !Email || !Phone || !Description) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const query = `
      UPDATE profolios
      SET "Firstname" = $1, "Lastname" = $2, "Email" = $3, "Phone" = $4, "Description" = $5
      WHERE id = $6
    `;
    const values = [Firstname, Lastname, Email, Phone, Description, id];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Profile not found ${id}` });
    }
    res.status(200).json({ message: "✅ Profile updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating data:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.delete("/api/profolio/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM profolios WHERE id = $1`;
    const values = [id];
    const result = await pool.query(query, values);

    if (result.rowCount > 0) {
      await pool.query("ALTER SEQUENCE profolios_id_seq RESTART WITH 1");

      res.status(200).json({ message: "Profile deleted and ID reset to 1" });
    } else {
      res.status(404).json({ error: "Profile not found" });
    }
  } catch (err) {
    console.error("❌ Error deleting profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
// const pool = require("../config/db");
// const {
//     createProfolio,
//     getProfolios,
//     updateProfolio,
//     deleteProfolio,
//   } = require("../controllers/profolioController");