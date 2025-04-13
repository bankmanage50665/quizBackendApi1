const express = require("express");
const router = express.Router();
const quizController = require("../controller/quizController");

router.post("/createQuiz", quizController.createQuestion);
router.get("/getAllQuestions", quizController.getAllQuestions);
router.delete("/:quizId", quizController.handleDeleteByQuizId);
router.get("/:id", quizController.getQuizById);
router.patch("/:id", quizController.handleUpdateQuiz);
router.post("/insertMultiple", quizController.insertManyQuizs);





module.exports = router;
