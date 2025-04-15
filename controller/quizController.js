const mongoose = require("mongoose");

// controllers/questionController.js

const Question = require("../model/quizModel"); // Adjust path as needed

/**
 * Create a new quiz question
 * @route POST /api/questions
 * @access Public (or could be protected with authentication middleware)
 */
const createQuestion = async (req, res) => {
  try {
    const { question, subject, options, correctAnswer } = req.body;

    // Basic validation
    if (!question || !subject || !options || correctAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create new question
    const newQuestion = await Question.create({
      question,
      subject,
      options,
      correctAnswer,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: newQuestion,
    });
  } catch (error) {
    // Handle specific validation errors from Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }

    // Handle other errors
    console.error("Error creating question:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "production" ? {} : error.message,
    });
  }
};

async function getAllQuestions(req, res) {
  try {
    // Get query parameters for filtering
    const { subject } = req.query;

    // Build filter object
    const filter = {};

    // Add subject filter if provided
    if (subject) {
      filter.subject = subject;
    }

    // Find questions based on filters
    const questions = await Question.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .select("-__v"); // Exclude version field

    // Return response
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
}

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID format",
      });
    }

    // Find the question by ID
    const question = await Question.findById(id);

    // If no question is found
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Quiz question not found",
      });
    }

    // Return the question
    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error fetching quiz by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

async function handleUpdateQuiz(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the question and update it
    const question = await Question.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    });

    // If question not found
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function handleDeleteByQuizId(req, res) {
  try {
    const { quizId } = req.params;

    // Validate if quizId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID format",
      });
    }

    // Find all questions with the given quizId and delete them
    const result = await Question.findById(quizId);

    const deletedQuestion = await result.deleteOne();

    // Check if any questions were deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this quiz ID",
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedQuestion.deletedCount} questions from quiz`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Insert multiple questions
const insertManyQuizs = async (req, res) => {
  try {
    const questions = req.body.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Questions must be a non-empty array" });
    }

    // Add user ID if needed (e.g., from auth middleware)
    const userId = req.user ? req.user._id : null;

    // Attach user and validate each question manually
    const questionsWithUser = questions.map((q) => ({
      ...q,
      user: q.user || userId,
    }));

    const insertedQuestions = await Question.insertMany(questionsWithUser, {
      ordered: true,
    });

    res.status(201).json({
      message: `${insertedQuestions.length} question(s) inserted successfully`,
      data: insertedQuestions,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "BulkWriteError") {
      return res
        .status(400)
        .json({ message: "Validation Error", error: error.message });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuizById,
  handleUpdateQuiz,
  handleDeleteByQuizId,
  insertManyQuizs,
};
