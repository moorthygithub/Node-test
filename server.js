// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const app = express();

// app.use(cors());
// app.use(express.json());
// const isProduction = process.env.NODE_ENV == "production";

// require("dotenv").config({
//   path: isProduction ? "/etc/secrets/env" : ".env",
// });
// // Routes
// app.use("/uploads", express.static("uploads"));

// const profolioRoutes = require("./routes/profolioRoutes");
// const loginRoutes = require("./routes/loginRoutes");
// const sinupRoutes = require("./routes/SignRoute");
// const productRoutes = require("./routes/productRoute");
// const verifyToken = require("./middleware/auth");
// const upload = require("./middleware/upload");
// app.use("/api/profolio", loginRoutes);
// app.use("/api/profolio", sinupRoutes);

// app.use("/api/profolio", verifyToken, profolioRoutes);
// app.use("/api/product", verifyToken, upload.array("Images", 5), productRoutes);

// const PORT = process.env.PORT || 3000;
// const ENV = process.env.DATABASE_URL;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
//   console.log(`🚀 env ${ENV}`);
// });
const express = require("express");
const cors = require("cors");
const app = express();

const isProduction = process.env.NODE_ENV === "production";
require("dotenv").config({
  path: isProduction ? "/etc/secrets/env" : ".env",
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
const profolioRoutes = require("./routes/profolioRoutes");
const loginRoutes = require("./routes/loginRoutes");
const sinupRoutes = require("./routes/SignRoute");
const productRoutes = require("./routes/productRoute");
const verifyToken = require("./middleware/auth");
const upload = require("./middleware/upload");

// Route Usage
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});
app.use("/api/profolio", loginRoutes);
app.use("/api/profolio", sinupRoutes);
app.use("/api/profolio",  profolioRoutes);
app.use("/api/product", verifyToken, upload.array("Images", 5), productRoutes);

// Test base route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// Start server
const PORT = process.env.PORT || 3000;
const ENV = process.env.DATABASE_URL;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 env ${ENV}`);
  console.log(`🌐 isProduction ${isProduction}`);
});
