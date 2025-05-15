const express = require("express");
const router = express.Router();
const {
  createProfolio,
  getProfolios,
  updateProfolio,
  deleteProfolio,
} = require("../controllers/profolioController");

router.post("/", createProfolio);
router.get("/", getProfolios);
router.put("/update", updateProfolio);
router.delete("/:id", deleteProfolio);

module.exports = router;
