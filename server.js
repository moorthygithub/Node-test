require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/uploads", express.static("uploads"));

const profolioRoutes = require("./routes/profolioRoutes");
const loginRoutes = require("./routes/loginRoutes");
const sinupRoutes = require("./routes/SignRoute");
const productRoutes = require("./routes/productRoute");
const verifyToken = require("./middleware/auth");
const upload = require("./middleware/upload");
app.use("/api/profolio", loginRoutes);
app.use("/api/profolio", sinupRoutes);

app.use("/api/profolio", verifyToken, profolioRoutes);
app.use("/api/product", verifyToken, upload.array("Images", 5), productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
