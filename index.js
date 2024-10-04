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
  const { fullName, email, password } = req.body; //received data from body of request

  if (!fullName) {
    return res.status(400).json({ message: "Full Name is required." });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  const isUser = await User.findOne({ email: email }); //check email exists in User with User.findOne

  if (isUser) {
    return res.json({ error: true, message: "User already exists." });
  }

  //if user dont exist, create new user from model User
  const user = new User({
    fullName,
    email,
    password,
  });
  await user.save(); // save user in database

  // create token when user created successfully
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m", // expires in 36000 minutes
  });

  // respone after token created include info data json type
  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registration successful",
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body; // received data from body of request

  if (!email) {
    return res.status(400).json({ message: "Nhập mail dô ní ơi" });
  }

  if (!password) {
    return res.status(400).json({ message: "Gõ cái mật khẩu dô" });
  }

  const userInfo = await User.findOne({ email: email }); //check email exists in User with User.findOne

  if (!userInfo) {
    return res.json({ error: true, message: "Email này chưa đăng ký ní ơi" });
  }

  if (userInfo.email === email && userInfo.password === password) {
    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m", // expires in 36000 minutes
    });

    return res.json({
      error: false,
      email,
      accessToken,
      message: "Đăng nhập được gùi",
    });
  }else{
    return res.status(400).json({
      error: true,
      message: "Mật khẩu đéo đúng.",
    });
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
}); // port 8000

module.exports = app; // module exports
