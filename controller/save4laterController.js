const SaveForLater = require("../model/save4model");

// Save a question for later
const saveQuestion = async (req, res) => {
  const { userId, questionId } = req.body;

  try {
    const saved = await SaveForLater.create({
      user: userId,
      question: questionId,
    });

    res.status(201).json({
      message: "Question saved successfully!",
      data: saved,
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: "You already saved this question." });
    } else {
      res
        .status(500)
        .json({ message: "Something went wrong.", error: err.message });
    }
  }
};

const getSavedQuestions = async (req, res) => {
  const { userId } = req.params;

  try {
    const savedQuestions = await SaveForLater.find({ user: userId })
      .populate("question")
      .sort({ createdAt: -1 }); // Sort by creation date, newest first (-1 for descending order)

    res.status(200).json({
      message: "Saved questions fetched successfully!",
      data: savedQuestions,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching saved questions.", error: err.message });
  }
};

module.exports = {
  saveQuestion,
  getSavedQuestions,
};

module.exports = { saveQuestion, getSavedQuestions };
