const express = require("express");
const router = express.Router();
const save4laterController = require("../controller/save4laterController");

router.post("/save4later", save4laterController.saveQuestion);
router.get("/:userId", save4laterController.getSavedQuestions);

module.exports = router;
