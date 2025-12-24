



require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// MongoDB
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("Mongo error:", err));

// =======================
// Routes
// =======================
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/history", require("./routes/history.routes"));

// Health check
app.get("/api/ai", (req, res) => {
  res.send("✅ AI API is running. Use POST request.");
});

// =======================
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
