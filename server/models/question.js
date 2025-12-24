

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    username: String,
    question: String,
    response: String,
  },
  { timestamps: true } // 🔥 MUST
);

module.exports = mongoose.model("Question", questionSchema);
