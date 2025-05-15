const pool = require("../config/db");
const transporter = require("../config/mailer");

exports.createProfolio = async (req, res) => {
  const { Firstname, Lastname, Email, Phone, Description } = req.body;
  if (!Firstname || !Lastname || !Email || !Phone || !Description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `INSERT INTO profolios ("Firstname", "Lastname", "Email", "Phone", "Description") VALUES ($1, $2, $3, $4, $5)`;
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

    res.status(200).json({ message: "✅ Data inserted successfully!" });
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getProfolios = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profolios");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateProfolio = async (req, res) => {
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

  try {
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Profile not found ${id}` });
    }
    res.status(200).json({ message: "✅ Profile updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating data:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteProfolio = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `DELETE FROM profolios WHERE id = $1`;
    const result = await pool.query(query, [id]);

    if (result.rowCount > 0) {
      await pool.query("ALTER SEQUENCE profolios_id_seq RESTART WITH 1");
      res.status(200).json({ message: "Profile Deleted" });
    } else {
      res.status(404).json({ error: "Profile not found" });
    }
  } catch (err) {
    console.error("❌ Error deleting profile:", err);
    res.status(500).json({ error: "Server error" });
  }
};
