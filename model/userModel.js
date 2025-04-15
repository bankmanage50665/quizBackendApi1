const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  phoneNumber: { type: Number, required: true, unique: true },
  otp: { type: String, required: false },
  otpExpiration: { type: Date, required: false },

  
  question: [{ type: mongoose.Types.ObjectId, ref: "Question" }],
  save4later: [{ type: mongoose.Types.ObjectId, ref: "SaveForLater" }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
