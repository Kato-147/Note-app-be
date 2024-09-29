const express = require("express"); // import express framework

const cors = require("cors"); // import cors package

const app = express(); // create express app instance and configure express middleware middle handlers with cors

app.use(express.json()); // use middleware to handle JSON data

app.use(cors({ origin: "*" })); // config cors to accept any request from the any domain

app.get("/", (req, res) => {
  res.json({ data: "hello world" });
});

app.listen(8000,() => {
    console.log('Server is running on port 8000');
  }); // port 8000

module.exports = app;
