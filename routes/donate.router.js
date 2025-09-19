const express = require("express");
const router =express.Router();
const isLooggedIn = require("../Middleware/isLoggedInMiddleware")
const { donateInformation } = require("../controllers/BloodRequestController");
router.post("/donateDets",isLooggedIn, donateInformation);

module.exports = router;