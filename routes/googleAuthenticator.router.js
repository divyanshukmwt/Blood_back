const express = require("express");
const router = express.Router();
const { verifyGoogleToken } = require("../controllers/GoogleControler");

router.post("/verify", verifyGoogleToken);

module.exports = router;
