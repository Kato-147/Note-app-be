const mongoose = require("mongoose");
const Schema = mongoose.Schema; // use the Schema of mongoDB for structure definition of doc in database mongo

// Define Note schema and model in MongoDB
const noteSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] }, // if note no tags, default is empty string
  isPinned: { type: Boolean , default: false },
  userId : { type: String, required: true},
  createOn: { type: Date, default: new Date().getTime() },
});

module.exports = mongoose.model("Note", noteSchema); // create a model can be use to interact with Mongoose
