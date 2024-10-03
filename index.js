require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose"); // import mongoose library

mongoose.connect(config.connectionString);

const User = require("./models/user.model"); // import user model

const express = require("express"); // import express framework
const cors = require("cors"); // import cors package
const app = express(); // create express app instance and configure express middleware middle handlers with cors

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json()); // use middleware to handle JSON data

app.use(cors({ origin: "*" })); // config cors to accept any request from the any domain
app.get("/", (req, res) => {
  res.json({ data: "hello world" });
});

// Create accounts
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res.status(400).json({ message: "Full Name is required." });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.json({ error: true, message: "User already exists." });
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m", // expires in 15 minutes
  });

  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration successful",
  });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
}); // port 8000

module.exports = app; // module exports
