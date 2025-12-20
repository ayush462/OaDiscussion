const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ============================
   GENERATE DESCRIPTION (SHORT)
============================ */
router.post("/generate-description", async (req, res) => {
  try {
    const { role, platform, difficulty, topics, questionPatterns } = req.body;

    if (!role || !platform || !difficulty || !topics?.length) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const prompt = `
You are generating a SHORT, CLEAN OA / Interview experience.

Constraints:
- Keep it concise
- Use bullet points
- Focus on TOPICS & QUESTION PATTERNS
- No long paragraphs

Role: ${role}
Platform: ${platform}
Difficulty: ${difficulty}
Topics: ${topics.join(", ")}
Question Patterns: ${questionPatterns?.join(", ") || "Not specified"}

Format STRICTLY like this:

## Overview
- 1–2 lines about OA/interview

## Topics Covered
- ${topics.join("\n- ")}

## Question Patterns
- ${questionPatterns?.join("\n- ") || "General DSA"}

## Question Level
- Easy / Medium / Hard with 1 line reason

## Example Question
- One short OA-style question (1–2 lines)

## Sample C++ Snippet
\`\`\`cpp
// 6–8 lines max
\`\`\`

## Tips
- 2–3 short bullet points
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an expert interview coach." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 600,
    });

    res.json({
      text: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("GROQ ERROR:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

/* ============================
   SUMMARIZE (PATTERN-FOCUSED)
============================ */
router.post("/summarize", async (req, res) => {
  try {
    const { text, topics, difficulty, questionPatterns } = req.body;

    const prompt = `
Summarize the following OA / interview experience.

Rules:
- VERY SHORT
- Pattern focused
- No filler text

Use this EXACT format:

## Topics
- ${topics?.join("\n- ") || "N/A"}

## Question Patterns
- ${questionPatterns?.join("\n- ") || "General DSA"}

## Question Level
- ${difficulty}

## Example Question
- 1 short OA-style question

## Sample Code (C++)
\`\`\`cpp
// 5–6 lines only
\`\`\`

Text:
${text}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    });

    res.json({
      summary: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "Summary failed" });
  }
});

module.exports = router;
