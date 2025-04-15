const twilio = require("twilio");
const OTPGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const HttpError = require("../middleware/HttpError");
const User = require("../model/userModel")

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);



async function sendOTP(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid user credentials", 401));
  }

  const { phoneNumber } = req.body;
  console.log(phoneNumber);

  const otp = OTPGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  console.log(otp);

  try {
    const user = await User.findOneAndUpdate(
      // Fixed typo here
      { phoneNumber },
      {
        otp,
        otpExpiration: new Date(Date.now() + 5 * 60 * 1000),
      },
      { new: true, upsert: true }
    );

    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Wrap Twilio API call in try-catch for better error handling
    try {
      // await client.messages.create({
      //   body: `Hoode: Your OTP is: ${otp}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: `+91${phoneNumber}`,
      // });
    } catch (twilioError) {
      console.error("Twilio Error:", twilioError);
      return next(
        new HttpError(
          "Failed to send SMS. Please check phone number or try again later.",
          500
        )
      );
    }

    console.log(otp);
    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (err) {
    console.error("Database Error:", err);
    return next(
      new HttpError("Failed to send OTP. Please try again later.", 500)
    );
  }
}

async function verifyOtp(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid user credentials", 401));
  }

  const { phoneNumber, otp } = req.body;

  console.log(phoneNumber, otp);

  let user;
  try {
    user = await User.findOne({ phoneNumber });
  } catch (err) {
    return next(
      new HttpError(
        "Failed to find user with phone number, Please try again later.",
        500
      )
    );
  }

  if (!user) {
    return next(new HttpError("User not found, Please register first", 404));
  }

  if (user.otp !== otp) {
    return next(new HttpError("Invalid OTP", 404));
  }

  if (user.otpExpiration < new Date()) {
    return next(new HttpError("OTP has expired", 404));
  }

  // Only update fields you need to change
  user.otp = undefined;
  user.otpExpiration = undefined;

  // Log the entire user object before saving

  try {
    await user.save();
  } catch (err) {
    console.error("Error while saving user:", err); // Log the error
    return next(
      new HttpError(
        "Failed to reset user OTP and OTP expiration, Please try again later.",
        500
      )
    );
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  });

  res.status(200).json({
    token,
    userId: user._id,
    phoneNumber,
    message: "OTP verified successfully",
  });
}

module.exports = {  sendOTP, verifyOtp };
