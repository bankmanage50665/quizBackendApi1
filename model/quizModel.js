const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    enum: [
      "Mathematics",
      "Science",
      "History",
      "Literature",
      "Geography",
      "Computer Science",
    ],
  },
  options: {
    type: [String],
    validate: {
      validator: function (options) {
        return options.length >= 2; // At least 2 options required
      },
      message: "At least 2 options are required",
    },
  },
  correctAnswer: {
    type: Number,
    required: [true, "Correct answer index is required"],
    validate: {
      validator: function (value) {
        return value >= 0 && value < this.options.length;
      },
      message: "Correct answer index must be valid",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
