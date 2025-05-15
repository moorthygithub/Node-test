const jwt = require("jsonwebtoken");
const pool = require("../config/db");
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM logintable WHERE email = $1",
      [email]
    );

    if (result.rows.length == 0) {
      return res.status(401).json({ error: "User Not Found" });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const payload = { email };
    const expiresIn = process.env.JWT_EXPIRES_IN || "2 days";
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
    });
    const now = new Date();
    let expiresAt = new Date(now);
    console.log("intially", expiresAt);
    const [amountStr, unit] = expiresIn.split(" ");
    const amount = parseInt(amountStr);
    console.log(amount, "amount");
    if (unit == "days" || unit == "day" || unit == "d") {
      expiresAt.setDate(now.getDate() + amount);
    } else if (unit == "hours" || unit == "hour" || unit == "h") {
      expiresAt.setHours(now.getHours() + amount);
    } else if (unit == "minutes" || unit == "minute" || unit == "m") {
      expiresAt.setMinutes(now.getMinutes() + amount);
    } else if (unit == "seconds" || unit == "second" || unit == "s") {
      expiresAt.setSeconds(now.getSeconds() + amount);
    } else {
      expiresAt.setDate(now.getDate() + 2);
    }
    const istTime = expiresAt.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    return res.status(200).json({
      token,
      expiresAt: istTime,
      username: user.email,
      usertype: user.usertype,
      name: user.name,
      id: user.id,
    });
  } catch (error) {
    console.error("Login error:", error);
    // return res.status(500).json({ error: "Internal Server Error" });
    console.error(error.stack, "stackstackstack");
    console.log(process.env.JWT_SECRET, "process.env.JWT_SECRET");
    const isDevelopment = process.env.JWT_SECRET !== "production";
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );
    console.log("Available tables in DB:", result.rows);

    return res.status(500).json({
      error: "Login failed",
      ...(isDevelopment && { message: error.message }),
    });
  }
};
