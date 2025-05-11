require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
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

app.post("/api/protfolio", async (req, res) => {
  console.log(req.body);
  //estructures the relevant fields (Firstname, Lastname, Email, Phone, and Description) from the incoming request body
  const { Firstname, Lastname, Email, Phone, Description } = req.body;


  if(!Firstname  || !Lastname || !Email || !Phone || !Description){
    return res.status(400).json({ "Missing Required Field " })
  }
});
