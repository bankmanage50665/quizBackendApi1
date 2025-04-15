const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv");
const HttpError = require("./middleware/HttpError");
dotenv.config();

const quizRouter = require("./router/quizRouter");
const userRouter = require("./router/userRouter");
const save4laterRouter = require("./router/save4laterRouter");

const url = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.wdrbduw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

app.use(bodyParser.json());
app.use(express.json());

app.use(
  cors({
    // origin: "http://localhost:3001", // Add both production and local URLs
    credentials: true,
  })
);

app.use("/api/quiz", quizRouter);
app.use("/api/user", userRouter);
app.use("/api/save", save4laterRouter);







app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((err, req, res, next) => {
  if (req.file) {
    fs.unlink(req.files.forEach((file) => file.path));
  }

  if (res.headerSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({
    message: err.message || "Something went wrong, Please try again later.",
  });
});

const PORT = process.env.PORT || 3001;

mongoose
  .connect(url)
  .then((req, res) => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(PORT);
    console.log(err);
  });
