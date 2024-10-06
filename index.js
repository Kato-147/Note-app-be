require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose"); // import mongoose library

mongoose.connect(config.connectionString);

const User = require("./models/user.model"); // import user model
const Note = require("./models/note.model"); // import note model

const express = require("express"); // import express framework
const cors = require("cors"); // import cors package
const app = express(); // create express app instance and configure express middleware middle handlers with cors

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json()); // use middleware to handle JSON data

app.use(cors({ origin: "*" })); // config cors to accept any request from the any domain

// create api
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
    return res.status(400).json({ message: "Nhập mail dô ní ơi" }); //check not null email
  }

  if (!password) {
    return res.status(400).json({ message: "Gõ cái mật khẩu dô" }); //check not null pass
  }

  const userInfo = await User.findOne({ email: email }); //check email exists in User with User.findOne

  if (!userInfo) {
    return res.json({ error: true, message: "Email này chưa đăng ký ní ơi" });
  }

  // check email and password is correct
  if (userInfo.email === email && userInfo.password === password) {
    // create token when user logged in successfully
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
  } else {
    return res.status(400).json({
      error: true,
      message: "Mật khẩu đéo đúng.",
    });
  }
});

//Add note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body; // received data from body of request
  const { user } = req.user;

  if (!title) {
    return res.status(400).json({ message: "Tiêu đe cần nhập." });
  }

  if (!content) {
    return res.status(400).json({ message: "Nội dung cần nhập." });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });
    await note.save(); // save note in database

    return res.json({ error: false, note, message: "Thêm ghi chú thành công" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Lỗi sever" });
  }
});

//Edit note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body; // received data from body of request
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập cả tiêu đ��, nội dung và th��." });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Ghi chú không tồn tại hoặc bạn không có quyền sửa.",
      });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({ error: false, note, message: "Sửa ghi chú thành công" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "lỗi server" });
  }
});

// get all notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ createOn: -1 }); // get all notes of user with sort by  descending

    return res.json({
      error: false,
      notes,
      message: "Lấy danh sách ghi chú thành công",
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi sever get all" });
  }
});

//Delete notes
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const noteId = req.params.noteId;

  try {
    const notes = await Note.findOne({ _id: noteId, userId: user._id });

    if (!notes) {
      return res
        .status(404)
        .json({
          error: true,
          message: "Ghi chú không tồn tại hoặc bạn không có quyền xóa",
        });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({ error: false, message: "Xóa ghi chú thành công" });

  } catch (error) {
    return res.status(500).json({ error: true, message: "Lỗi sever delete" });
  }
});

//Update is Pinned value
app.put('/update-note-pinned/:noteId', authenticateToken, async (req, res)=>{
  const noteId = req.params.noteId;
  const {isPinned } = req.body; // received data from body of request
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Ghi chú không tồn tại hoặc bạn không có quyền sửa.",
      });
    }

    note.isPinned = isPinned;

    await note.save();

    return res.json({ error: false, note, message: "cập nhật ghi chú thành công" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "lỗi server" });
  }
})

app.listen(8000, () => {
  console.log("Server is running on port 8000");
}); // port 8000

module.exports = app; // module exports
