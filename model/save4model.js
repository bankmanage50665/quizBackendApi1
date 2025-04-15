const mongoose = require("mongoose");
const { Schema } = mongoose;

const saveForLaterSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question ID is required"],
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to prevent a user from saving the same question multiple times
saveForLaterSchema.index({ user: 1, question: 1 }, { unique: true });

const SaveForLater = mongoose.model("SaveForLater", saveForLaterSchema);
module.exports = SaveForLater;
