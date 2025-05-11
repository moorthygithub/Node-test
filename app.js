require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const app = express();
app.use(cors());
//it automaticallly parse incoming json data to the req.body
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// app.post("/api/protfolio", async (req, res) => {
//   console.log(req.body);
//   //estructures the relevant fields (Firstname, Lastname, Email, Phone, and Description) from the incoming request body
//   const { Firstname, Lastname, Email, Phone, Description } = req.body;

//   if(!Firstname  || !Lastname || !Email || !Phone || !Description){
//     return res.status(400).json({ "Missing Required Field " })
//   }
// });
app.post("/api/post", async (req, res) => {
  const { firstname, lastname, description } = req.body;
  if (!firstname || !lastname || !description) {
    return res.status(400).json({ error: "Missing required Field" });
  }
  const query = `INSERT INTO PROTFOLIO (firstname,lastname,description)VALUES($1,$2,$3)`;
  const value = [firstname, lastname, description];

  try {
    await pool.query(query, value);
    res.status(200).json({ message: "Inserted Sucessfully" });
  } catch (error) {
    res.status(500).json({ error: `Server Error || ${error}` });
  }
});

app.get("/app/get", async (req, res) => {
  const query = `SELECT * FROM PROTFOLIOS`;
  try {
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch {
    res.status(500).json({ error: "Serveer Error" });
  }
});
app.post("/api/update", async (req, res) => {
  const { firstname, lastname, description } = req.body;
  if (!firstname || !lastname || !description) {
    return res.status(400).json({ error: "Missing required Field" });
  }
  const query = `UPDTAE  PROTFOLIO SET firstname =$1,lastname =$2,description=$3 WHERE id =$4`;
  const value = [firstname, lastname, description];

  try {
    const result = await pool.query(query, value);

    if (result.rowCount === 0) {
      res.status(400).json({ error: "Id Not Founf" });
    }
    res.status(200).json({ message: "UPdated Sucessfully" });
  } catch (error) {
    res.status(500).json({ error: `Server Error || ${error}` });
  }
});
app.get("/app/delete/:id", async (req, res) => {
  const { id } = req.params;
  const query = `DEELETE  FROM PROTFOLIOS WHERE id =$1 `;
  const value = id;
  try {
    const result = await pool.query(query, value);
    if (result.rowCount > 0) {
      await pool.query("ALTER SEQUENCE profolios_id_seq RESTART WITH 1");
      res.status(200).json({ message: "Deleted Sucesfully" });
    } else {
      res.status(404).json({ error: "Profile is not there" });
    }
  } catch {
    res.status(500).json({ error: "Serveer Error" });
  }
});
