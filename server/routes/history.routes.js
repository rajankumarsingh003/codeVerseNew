

const express = require("express");
const router = express.Router();
const Question = require("../models/question");

// GET HISTORY
router.get("/:username", async (req, res) => {
  try {
    const data = await Question.find({
      username: req.params.username,
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// CLEAR HISTORY
router.delete("/:username", async (req, res) => {
  try {
    await Question.deleteMany({
      username: req.params.username,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history" });
  }
});

module.exports = router;
