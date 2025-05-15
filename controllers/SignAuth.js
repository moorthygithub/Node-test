const pool = require("../config/db");
exports.sign = async (req, res) => {
  const { name, email, password, usertype, mobile } = req.body;

  if (!name || !email || !password || !usertype || !mobile) {
    return res(400).json({ error: "Missing Required Field" });
  }
  try {
    const query = `INSERT INTO logintable ("name","email","password","usertype","mobile") VALUES ($1,$2 ,$3,$4,$5)   RETURNING *`;
    const value = [name, email, password, usertype, mobile];
    // await pool.query("ALTER SEQUENCE logintable_id_seq  RESTART WITH 1");
    await pool.query(query, value);
    res.status(200).json({ message: "✅ Register Sucess" });
  } catch (error) {
    console.error("❌ Error inserting data:", error);

    if (error.code == "23505") {
      const detail = error.detail || "";

      if (detail.includes("(email)")) {
        return res.status(409).json({ error: "Email already registered" });
      } else if (detail.includes("(mobile)")) {
        return res
          .status(409)
          .json({ error: "Mobile number already registered" });
      } else {
        return res.status(409).json({ error: "Duplicate entry" });
      }
    }

    res.status(500).json({ error: "Server error" });
  }
};
