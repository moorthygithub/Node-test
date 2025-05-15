const express = require("express");
const { sign } = require("../controllers/SignAuth");
const router = express.Router();

router.post("/register", sign);

module.exports = router;
