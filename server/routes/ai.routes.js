


const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
const Question = require("../models/question");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/generate", async (req, res) => {
  const { question, username } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
    });

    const text = response.text;

    await Question.create({ username, question, response: text });

    res.json({ response: text });
  } catch (e) {
    res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;

