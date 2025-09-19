const express = require("express");
const router = express.Router();
const { pdfGenerator } = require("../controllers/pdfGenerator")

router.post("/generatePdf", pdfGenerator)

module.exports = router;